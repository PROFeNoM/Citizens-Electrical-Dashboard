# API endpoints

*Tip: How to get Unix Epoch millis in JavaScript:*

```JavaScript
const myDate = new Date('2021-01-02T22:59:59Z');
const epoch = myDate.getTime();
```

## `/consumption`

### params

- minDate: Unix Epoch millis
- maxDate: Unix Epoch millis
- profiles (optional): array of profiles to filter ouput

### profiles

- PUBLIC_LIGHTING
- PROFESSIONAL
- RESIDENTIAL
- TERTIARY

### example

http://localhost:5000/consumption?minDate=1609455600000&maxDate=1609628399000&profiles[0]=PUBLIC_LIGHTING

## `/production`

### params

- minDate: Unix Epoch millis
- maxDate: Unix Epoch millis
- profiles (optional): array of profiles to filter ouput

### profiles

- BIOENERGY
- EOLIAN
- HYDRAULIC
- NON_RENEWABLE_THERMAL
- OTHER
- SOLAR
- TOTAL

### example

http://localhost:5000/production?minDate=1609455600000&maxDate=1609628399000&profiles[0]=SOLAR&profiles[1]=EOLIAN