import pandas as pd
from datetime import datetime, timedelta
from prophet import Prophet


def _load_data_st(path):
    """
    This function loads the historical data from the path specified
    """
    df = pd.read_csv(path, sep=',')
    df['ds'] = pd.to_datetime(df['ds'])
    return df


data_st = _load_data_st('./data_st/data_st_pro.csv')


def is_winter(ds):
    '''
    This function converts each timestamp into a binary value based on whether
    or not it falls in the months of December, January, or February
    '''
    return 1 if ((ds.month % 12 + 3) // 3) == 1 else 0


def is_summer(ds):
    '''
    This function converts each timestamp into a binary value based on whether
    or not it falls in the months of June, July, or August
    '''
    return 1 if ((ds.month % 12 + 3) // 3) == 3 else 0


def fill_regressors(ds):
    """
    This function takes in a datetime and returns the average `weather_pc` and
    'visibility` (standardized) value for each observation in the historical
    dataset.

    The mean value is based on observations that occur in the same month, on the
    same day, and within +/- 3 hours of the input datetime.
    """
    month = ds.month
    day = ds.day
    hour = ds.hour
    sub = data_st[(data_st.ds.dt.month == month) & (data_st.ds.dt.day == day) & (abs(data_st.ds.dt.hour - hour) <= 3)]
    return sub[['weather_pc', 'visibility']].mean()


def make_df_without_regressors(date_start, date_end, capacity, floor):
    # Create a list of utc+01 dates from date_start to date_end with a frequency of 30 minutes
    # date_start and date_end are datetime objects
    df = pd.date_range(date_start, date_end, freq='30min')
    # Convert the list to a dataframe with a column called 'ds'
    df = pd.DataFrame({'ds': df})

    # Fill the column for the growth logistic feature
    df['cap'] = capacity
    df['floor'] = floor

    return df


def make_df_with_regressors(date_start, date_end, capacity, floor):
    """
    This function takes in a Prophet model, a start and end date, and a capacity
    and floor value, and returns a suitable dataframe to be used for forecasting.

    The dataframe is constructed by taking the historical data from the PRO model
    """
    # Create a dataframe with the same data as the historical dataset
    df = make_df_without_regressors(date_start, date_end, capacity, floor)

    # Fill seasonality conditions
    df['is_winter'] = df['ds'].apply(is_winter)
    df['is_summer'] = df['ds'].apply(is_summer)
    df['is_spring_fall'] = ~(df.is_winter | df.is_summer) + 2

    # Forecast the weather and visibility for the prediction period
    df_weather_regressors = df.ds.apply(fill_regressors)

    # Add the forecasted data to the prediction period dataframe
    df['weather_pc'] = df_weather_regressors['weather_pc']
    df['weather_pc2'] = df_weather_regressors['visibility']
    df.dropna(inplace=True)

    return df
