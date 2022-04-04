# Take three arguments from the command line

import csv
import sys
import os
import re
import argparse

import pickle

import pandas as pd

from datetime import datetime, timedelta
from prophet import Prophet


def load_model(model):
    return pickle.load(open(model, 'rb'))


def parse_arguments():
    parser = argparse.ArgumentParser(description='Generate a CSV file for a given model between two dates')
    parser.add_argument('-p', '--prophet', help='Prophet model path', required=True)
    parser.add_argument('-c', '--cap', help='Capacity of the model', required=True)
    parser.add_argument('-f', '--floor', help='Floor of the model', required=True)
    parser.add_argument('-d', '--date_start', help='Start date', required=True)
    parser.add_argument('-e', '--date_end', help='End date', required=True)
    parser.add_argument('-o', '--output', help='Output file name', required=True)
    args = parser.parse_args()

    model = args.prophet
    capacity = args.cap
    floor = args.floor
    date_start = args.date_start
    date_end = args.date_end
    output = args.output

    # Check if the model exists
    if not os.path.exists(model):
        print('Model path does not exist')
        sys.exit(1)

    # Check if capacity and floor are numbers
    if not re.match(r'^[0-9]+$', capacity):
        print('Capacity is not a number')
        sys.exit(1)
    if not re.match(r'^[0-9]+$', floor):
        print('Floor is not a number')
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

    return model, capacity, floor, date_start, date_end, output


def make_df(date_start, date_end, capacity, floor):
    # Create a list of dates from date_start to date_end with a frequency of 30 minutes
    # date_start and date_end are datetime objects
    dates = [date_start + timedelta(minutes=30 * x)
             for x in range(0, int((date_end - date_start).total_seconds() // 1800))]

    # Create a dataframe with the dates and the corresponding predictions
    df = pd.DataFrame({'ds': dates})
    df['cap'] = capacity
    df['floor'] = floor
    return df


def make_forecast(model, df):
    # Make a prediction
    forecast = model.predict(df)
    return forecast


# TODO: Don't use mean_curve, but actual energy load instead
def make_csv(forecast, output):
    # Create a csv file with the predictions
    # The output will be a csv file with the following columns:
    # timestamp, mean_curve
    with open(output, 'w') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(['timestamp', 'mean_curve'])
        for i in range(len(forecast)):
            writer.writerow([forecast['ds'][i], forecast['yhat'][i]])


def main():
    model_path, capacity, floor, date_start, date_end, output = parse_arguments()

    print(f"Generating CSV file for {model_path} between {date_start} and {date_end}")
    print(f"Output file: {output}")

    # Load the pickle model
    model = load_model(model_path)
    print(f"Model loaded")

    # Create a dataframe with the dates and the corresponding predictions
    df = make_df(date_start, date_end)
    print(f"Dataframe created")
    print(df)

    # Make a prediction
    forecast = make_forecast(model, df)
    print(f"Prediction made")
    print(forecast)


if __name__ == "__main__":
    main()
