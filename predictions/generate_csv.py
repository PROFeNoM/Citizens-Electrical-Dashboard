# Example command line arguments: -p models/res.pickle -d 2022-01-01 -e 2022-03-31 -o test.csv -t RES
# Example command line arguments: -p models/pro.pickle -d 2022-01-01 -e 2022-03-31 -o test.csv -t PRO
# Example command line arguments: -p models/ent.pickle -d 2022-01-01 -e 2022-03-31 -o test.csv -t ENT

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

FLOOR = 0
CAPACITY = {
    "RES": 4.338139563583263,
    "PRO": 4.805705472720941,
    "ENT": 4.915918212083008
}
STD = {
    "RES": 6008.733365479282,
    "PRO": 5837.368867533356,
    "ENT": 262.8963698897594
}
MEAN = {
    "RES": 17767.7300501596,
    "PRO": 28828.770405836753,
    "ENT": 1684.0191228070175
}
NB_SOUTIRAGE = {
    "RES": 6336730,
    "PRO": 895700,
    "ENT": 1387
}


def unstandardize(yhat, std, mean):
    return yhat * std + mean


def load_model(model):
    return pickle.load(open(model, 'rb'))


def parse_arguments():
    parser = argparse.ArgumentParser(description='Generate a CSV file for a given model between two dates')
    parser.add_argument('-p', '--prophet', help='Prophet model path', required=True)
    parser.add_argument('-t', '--type', help='Type of model', required=True)
    parser.add_argument('-d', '--date_start', help='Start date', required=True)
    parser.add_argument('-e', '--date_end', help='End date', required=True)
    parser.add_argument('-o', '--output', help='Output file name', required=True)
    args = parser.parse_args()

    model = args.prophet
    profile = args.type
    date_start = args.date_start
    date_end = args.date_end
    output = args.output

    # Check if the model exists
    if not os.path.exists(model):
        print('Model path does not exist')
        sys.exit(1)

    # Type can either be 'RES', 'PRO' or 'ENT'
    if profile not in ['RES', 'PRO', 'ENT']:
        print('Type should either be RES, PRO or ENT')
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

    return model, profile, date_start, date_end, output


def make_df(date_start, date_end, capacity, floor, profile):
    if profile == 'PRO':
        return make_df_with_regressors(date_start, date_end, capacity, floor)
    return make_df_without_regressors(date_start, date_end, capacity, floor)


def make_forecast(model, df, profile):
    # Make a prediction
    forecast = model.predict(df)
    forecast['yhat'] = unstandardize(forecast['yhat'], STD[profile], MEAN[profile])
    return forecast


def make_csv(forecast, output, profile):
    # Create a csv file with the predictions
    # The output will be a csv file with the following columns:
    # timestamp, mean_curve
    # timestamp is in the format YYYY-MM-DDTHH:MM:SS+01:00

    with open(output, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow([
            'Horodate',
            'Total énergie soutirée (Wh)',
            'Nb points soutirage',
            'Courbe Moyenne n°1 + n°2 (Wh)',
            'Profil'
        ])
        for i in range(len(forecast)):
            writer.writerow([
                forecast['ds'][i].strftime('%Y-%m-%dT%H:%M:%S+01:00'),
                forecast['yhat'][i] * NB_SOUTIRAGE[profile],
                NB_SOUTIRAGE[profile],
                forecast['yhat'][i],
                profile
            ])


def main():
    model_path, profile, date_start, date_end, output = parse_arguments()

    print(f"Generating CSV file for {model_path} between {date_start} and {date_end}")
    print(f"Output file: {output}")

    # Load the pickle model
    model = load_model(model_path)
    print(f"Model loaded")

    # Create a dataframe with the dates and the corresponding predictions
    df = make_df(date_start, date_end, CAPACITY[profile], FLOOR, profile)
    print(f"Dataframe created")

    # Make a prediction
    forecast = make_forecast(model, df, profile)
    print(f"Prediction made")

    # Create a csv file with the predictions
    make_csv(forecast, output, profile)
    print("CSV file created")


if __name__ == "__main__":
    main()
