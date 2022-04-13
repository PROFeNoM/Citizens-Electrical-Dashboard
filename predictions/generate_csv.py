# Example command line arguments: -pm models/mean_curve_models/res.pickle -pt models/total_models/res.pickle -d 2022-01-01 -e 2022-03-31 -o test.csv -t RES
# Example command line arguments: -pm models/mean_curve_models/pro.pickle -pt models/total_models/pro.pickle -d 2022-01-01 -e 2022-03-31 -o test.csv -t PRO
# Example command line arguments: -pm models/mean_curve_models/ent.pickle -pt models/total_models/ent.pickle -d 2022-01-01 -e 2022-03-31 -o test.csv -t ENT
# Example command line arguments: -pm models/mean_curve_models/solar.pickle -pt models/total_models/solar.pickle -d 2022-01-01 -e 2022-03-31 -o test.csv -t SOLAR
# Example command line arguments: -d 2022-01-01 -e 2022-03-31 -o test.csv -t LIGHTING

import csv
import sys
import os
import re
import argparse

import pickle

import pandas as pd

from datetime import datetime, timedelta
from prophet import Prophet

from df_utils import make_df_without_regressors, make_df_with_regressors

LIGHTING_DATA_PATH = 'data/lightingData2021.csv'

FLOOR = 0
CAPACITY = {
    "mean_curve": {
        "RES": 4.338139563583263,
        "PRO": 5.191151067264514,
        "ENT": 4.915918212083008,
        "SOLAR": 3.8506187084377586,
    },
    "total": {
        "RES": 4.431937432252885,
        "PRO": 4.5423538510023,
        "ENT": 3.1148380419963018,
        "SOLAR": 4.080539845136828
    }
}
STD = {
    "mean_curve": {
        "RES": 6069.960378819583,
        "PRO": 4398.5461183289035,
        "ENT": 262.8963698897594,
        "SOLAR": 2244600.5946435267
    },
    "total": {
        "RES": 674213991.1630179,
        "PRO": 112218025.89827447,
        "ENT": 327627.9321726365,
        "SOLAR": 471421360.85562223
    }
}
MEAN = {
    "mean_curve": {
        "RES": 17913.352807017545,
        "PRO": 21176.57446990424,
        "ENT": 1684.0191228070175,
        "SOLAR": 1520930.7977459312
    },
    "total": {
        "RES": 1787207064.0133379,
        "PRO": 375758437.59091425,
        "ENT": 2458161.711040073,
        "SOLAR": 328610356.3166721
    }
}
NB_POINTS = {
    "RES": 6342782,
    "PRO": 781606,
    "ENT": 1444,
    "SOLAR": 139587
}


def unstandardize(yhat, std, mean):
    return yhat * std + mean


def load_model(model):
    return pickle.load(open(model, 'rb'))


def parse_arguments():
    parser = argparse.ArgumentParser(description='Generate a CSV file for a given model between two dates')
    parser.add_argument('-pm', '--prophet_mean', help='Prophet mean curve model path. Not required for LIGHTING', required=False)
    parser.add_argument('-pt', '--prophet_total', help='Prophet total energy model path. Not required for LIGHTING', required=False)
    parser.add_argument('-t', '--type', help='Type of model', required=True)
    parser.add_argument('-d', '--date_start', help='Start date', required=True)
    parser.add_argument('-e', '--date_end', help='End date', required=True)
    parser.add_argument('-o', '--output', help='Output file name', required=True)
    args = parser.parse_args()

    mean_model = args.prophet_mean
    total_model = args.prophet_total
    profile = args.type
    date_start = args.date_start
    date_end = args.date_end
    output = args.output

    # Check if the model exists
    if profile != 'LIGHTING' and not os.path.exists(mean_model):
        print('Mean model path does not exist')
        sys.exit(1)
    if profile != 'LIGHTING' and not os.path.exists(total_model):
        print('Total model path does not exist')
        sys.exit(1)

    # Type can either be 'RES', 'PRO' or 'ENT'
    if profile not in ['RES', 'PRO', 'ENT', 'SOLAR', 'LIGHTING']:
        print('Type should either be RES, PRO, ENT, SOLAR, or LIGHTING')
        sys.exit(1)

    # Check if the dates format are valid
    if not re.match(r'\d{4}-\d{2}-\d{2}', date_start):
        print('Start date is not valid. Format should be YYYY-MM-DD')
        sys.exit(1)
    if not re.match(r'\d{4}-\d{2}-\d{2}', date_end):
        print('End date is not valid. Format should be YYYY-MM-DD')
        sys.exit(1)
    # Date start should be before date end
    if date_start > date_end:
        print('Start date should be before end date')
        sys.exit(1)
    # Check if dates are valid
    try:
        date_start = datetime.strptime(date_start, '%Y-%m-%d')
        date_end = datetime.strptime(date_end, '%Y-%m-%d')
    except ValueError:
        print('Date does not exist')
        sys.exit(1)

    return mean_model, total_model, profile, date_start, date_end, output


def make_df(date_start, date_end, capacity, floor, extended_dataframe=False):
    if extended_dataframe:
        return make_df_with_regressors(date_start, date_end, capacity, floor)
    return make_df_without_regressors(date_start, date_end, capacity, floor)


def make_forecast(model, df, std, mean):
    # Make a prediction
    forecast = model.predict(df)
    forecast['yhat'] = unstandardize(forecast['yhat'], std, mean)
    return forecast


def make_csv(forecast_total, forecast_mean, output, profile):
    # Create a csv file with the predictions
    # The output will be a csv file with the following columns:
    # timestamp, mean_curve
    # timestamp is in the format YYYY-MM-DDTHH:MM:SS+01:00

    with open(output, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow([
            'Horodate',
            'Total énergie soutirée (Wh)' if profile != 'SOLAR' else 'Total énergie injectée (Wh)',
            'Nb points soutirage' if profile != 'SOLAR' else 'Nb points injection',
            'Courbe Moyenne n°1 + n°2 (Wh)',
            'Profil' if profile != 'SOLAR' else 'Filière de production'
        ])
        for i in range(len(forecast_total)):
            writer.writerow([
                forecast_total['ds'][i].strftime('%Y-%m-%dT%H:%M:%S+01:00'),
                forecast_total['yhat'][i] if forecast_total['yhat'][i] > 0 else 0,
                NB_POINTS[profile],
                forecast_mean['yhat'][i] if forecast_mean['yhat'][i] > 0 else 0,
                profile if profile != 'SOLAR' else 'F5 : Solaire'
            ])


def main():
    mean_model_path, total_model_path, profile, date_start, date_end, output = parse_arguments()

    print(f"Generating CSV file for mean model {mean_model_path} and total model {total_model_path} between {date_start} and {date_end}")
    print(f"Output file: {output}")

    if profile == 'LIGHTING':
        # Load the csv file located at the path data/lightingData2021.csv
        df = pd.read_csv(LIGHTING_DATA_PATH)
        # Convert the 'Horodate' column to datetime
        df['Horodate'] = pd.to_datetime(df['Horodate'], utc=True).dt.tz_convert(None)
        # Only keep the data that have there month and day between date_start and date_end, independently of the year
        df = df[(df['Horodate'].dt.month >= date_start.month) & (df['Horodate'].dt.month <= date_end.month)]

        year_offset = date_start.year - df['Horodate'].dt.year.min()
        # Add the year offset to the records
        df['Horodate'] = df['Horodate'] + pd.DateOffset(months=12*year_offset)

        df['Horodate'] = df['Horodate'].dt.strftime('%Y-%m-%dT%H:%M:%S+01:00')
        df.to_csv(output, index=False)
        print("CSV file created")
        return

    # Load the pickle model
    mean_model = load_model(mean_model_path)
    print(f"Mean model loaded")
    total_model = load_model(total_model_path)
    print(f"Total model loaded")

    # Create a dataframe with the dates and the corresponding predictions
    df_mean = make_df(date_start, date_end, CAPACITY['mean_curve'][profile], FLOOR, profile == 'PRO')
    print(f"Mean model dataframe created")
    df_total = make_df(date_start, date_end, CAPACITY['total'][profile], FLOOR)
    print(f"Total model dataframe created")

    # Make a prediction
    forecast_mean = make_forecast(mean_model, df_mean, STD['mean_curve'][profile], MEAN['mean_curve'][profile])
    print(f"Mean curve predictions made")
    forecast_total = make_forecast(total_model, df_total, STD['total'][profile], MEAN['total'][profile])
    print(f"Total energy predictions made")

    # Create a csv file with the predictions
    make_csv(forecast_total, forecast_mean, output, profile)
    print("CSV file created")


if __name__ == "__main__":
    main()
