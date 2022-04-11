import axios from 'axios';
import * as FormData from 'form-data'

main().catch(console.error);

async function main() {
	const NW = [44.85167061339378, -0.5671098076715935];
	const SE = [44.83706864026471, -0.5441770324348592];

	const n = 2;
	const latStep = (SE[0] - NW[0]) / n;
	const longStep = (SE[1] - NW[1]) / n;

	let csv = 'latitude;longitude\n';
	for (let lat = NW[0]; lat > SE[0]; lat += latStep) {
		for (let long = NW[1]; long < SE[1]; long += longStep) {
			csv += `${lat};${long}\n`
		}
	}

	const form = new FormData();
	form.append('data', csv, { filename: 'data.csv' });
	const res = await axios.post('https://api-adresse.data.gouv.fr/reverse/csv', form, { headers: form.getHeaders() })

	console.log(res.data);
}
