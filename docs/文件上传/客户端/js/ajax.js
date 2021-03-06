function $ajax(options) {
	options = Object.assign({
		url: '',
		method: 'post',
		data: null,
		headers: {},
		progress: Function.prototype
	}, options);

	return new Promise((resolve, reject) => {
		let xhr = new XMLHttpRequest;
		xhr.upload.onprogress = options.progress;
		xhr.open(options.method, options.url);
		Object.keys(options.headers).forEach(key => {
			xhr.setRequestHeader(key, options.headers[key]);
		});
		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				if (/^(2|3)\d{2}$/.test(xhr.status)) {
					resolve(JSON.parse(xhr.responseText));
					return;
				}
				reject(xhr);
			}
		};
		xhr.send(options.data);
	});
}

function $formatFileName(filename) {
	let dotIndex = filename.lastIndexOf('.'),
		name = filename.substring(0, dotIndex),
		suffix = filename.substring(dotIndex + 1);
	name = md5(name) + new Date().getTime();
	return {
		hash: name,
		suffix,
		filename: `${name}.${suffix}`
	};
}