import { getDistrictArea } from "../scripts/dbUtils"

it('Area of La Bastide', () => {
    expect(getDistrictArea()).toBeCloseTo(1027673.9721528001);
})