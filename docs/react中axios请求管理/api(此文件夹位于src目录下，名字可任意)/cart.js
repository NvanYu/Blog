import axios from './axios';
const suffix = '/cart';
export default {
	list(state = 0) {
		return axios.get(`${suffix}/list`, {
			params: {
				state
			}
		});
	},
	add(pid, count = 1) {
		return axios.post(`${suffix}/add`, {
			pid,
			count
		});
	}
};