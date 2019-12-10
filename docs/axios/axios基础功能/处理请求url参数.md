## 处理请求 url 参数

> 根据axios的使用功能用法

```typescript
axios({
  method: 'get',
  url: '/base/get',
  params: {
    a: 1,
    b: 2
  }
})
```

最终我们请求的url是/base/get?a=1&b=2,实际上就是把 `params` 对象的 key 和 value 拼接到 `url` 上。

但是也有特殊情况，比如：

1. 参数值为数组

```typescript
axios({
  method: 'get',
  url: '/base/get',
  params: {
    foo: ['bar', 'baz']
  }
})
// 最终请求的 url 是 /base/get?foo[]=bar&foo[]=baz'
```

2. 参数值为对象

```typescript
axios({
  method: 'get',
  url: '/base/get',
  params: {
    foo: {
      bar: 'baz'
    }
  }
})
// 最终请求的 url 是 /base/get?foo=%7B%22bar%22:%22baz%22%7D，foo 后面拼接的是 {"bar":"baz"} encode 后的结果。
```

3. 参数值为Date类型

```typescript
const date = new Date()

axios({
  method: 'get',
  url: '/base/get',
  params: {
    date
  }
})
// 最终请求的 url 是 /base/get?date=2019-04-01T05:55:39.030Z，date 后面拼接的是 date.toISOString() 的结果。
```

4. 特殊字符支持

对于字符 @、: 、$ 、逗号、反引号、中括号[ 、中括号 ]，我们是允许出现在 `url` 中的，不希望被 encode。

```typescript
axios({
  method: 'get',
  url: '/base/get',
  params: {
    foo: '@:$, '
  }
})
// 最终请求的 url 是 /base/get?foo=@:$+，注意，我们会把空格转换成 +。
```

5. 空值忽略

对于值为 `null` 或者 `undefined` 的属性，我们是不会添加到 url 参数中的。

```typescript
axios({
  method: 'get',
  url: '/base/get',
  params: {
    foo: 'bar',
    baz: null
  }
})
// 最终请求的 url 是 /base/get?foo=bar
```

6. 丢弃url中的hash标记

```typescript
axios({
  method: 'get',
  url: '/base/get#hash',
  params: {
    foo: 'bar'
  }
})
// 最终请求的 url 是 /base/get?foo=bar
```

7. 保留url中已存在的参数

```typescript
axios({
  method: 'get',
  url: '/base/get?foo=bar',
  params: {
    bar: 'baz'
  }
})
// 最终请求的 url 是 /base/get?foo=bar&bar=baz
```



## 工具函数绑定params到url上

helpers/util.ts

```typescript
const toString = Object.prototype.toString

export function isDate (val: any): val is Date {
  return toString.call(val) === '[object Date]'
}

export function isObject (val: any): val is Object {
  return val !== null && typeof val === 'object'
}

```

helpers/url.ts

```typescript
import {isDate, isObject} from './util.ts';

function encode (val: string): string {
  // 特殊字符支持
  return encodeURIComponent(val)
    .replace(/%40/g, '@')
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, '+')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']')
}

export function buildURL(url:string, params?: any) {
    if(!params) {
        return url;  // 如果没有params参数，直接返回url即可
    }
    const parts:string[] = [];
    Object.keys(params).forEach(key => {
        let val = params[key];
        // 忽略空值
        if (val === null || typeof val === 'undefined') {
      		return
    	}
        let values: string[];
        if(Array.isArray(val)) {
            values = val;
            key += '[]';
        } else {
            values = [val];
        }
        values.forEach(val => {
            if(isDate(val)) {
                val = val.toISOString();
            } else if(isObject(val)) {
                val = JSON.stringify(val);
            }
            parts.push(`${encode(key)}=${encode(val)}`)
        })
    })
    let serializedParams = parts.join('&')

  	if (serializedParams) {
    	const markIndex = url.indexOf('#')
    	if (markIndex !== -1) {
      		url = url.slice(0, markIndex)
    	}

    	url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams
  	}

  	return url
}
```



## 实现url参数处理逻辑

src/index.ts

```typescript
function axios (config: AxiosRequestConfig): void {
  processConfig(config)
  xhr(config)
}

function processConfig (config: AxiosRequestConfig): void {
  config.url = transformUrl(config)
}

function transformUrl (config: AxiosRequestConfig): string {
  const { url, params } = config
  return bulidURL(url, params)
}
```

