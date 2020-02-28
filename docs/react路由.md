# react-router-dom 实现SPA单页面应用

```bash
$ yarn add react-router-dom
```

### 基础使用

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import {HashRouter, Route} from 'react-router-dom';

/*
 * REACT-ROUTER中提供了两种路由方式：
 *   1、BROWSER-ROUTER (基于H5中的HISTORY-API完成的)
 *     http://www.xxx.com/user
 *     http://www.xxx.com/user/singin
 *
 *   2、HASH-ROUTER （基于HASH值处理）
 *     http://www.xxx.com/#/user
 *     http://www.xxx.com/#/user/singin
 *
 *   如果项目是单纯静态页面展示(数据绑定是有客户端完成的)，一般我们都使用HASH-ROUTER完成；如果当前的项目有些内容是需要后台完成，我们尽量使用BROWSER-ROUTER，因为HASH值不太容易和服务器端产生关联；
 *
 * ------------------
 *
 * 每一个ROUTER(HASH-ROUTER或者BROWSER-ROUTER)都只能有一个子元素，我们需要把我们配置的每一条规则(ROUTE)放到一个容器中
 */

import A from './component/A';
import B from './component/B';
import C from './component/C';

ReactDOM.render(<HashRouter>
    <div>
        {/*
          * path:当前请求的路径(指的是HASH值后的内容)
          * component:符合当前路径后渲染的组件
          * render:符合当前路径后执行的渲染方法(方法中可以根据自己的需求返回不同的组件或者内容,用来最后渲染)
          * exact
          * strict
          *
          * 默认情况下，只要PATH='/'，基本上所有请求的路径都可以把它匹配了，而这种路径一般都是首页的路径，我们如何控制，只有路径是一个斜杠才匹配，只要后面再有其它内容，就让其不匹配?
          * =>使用ROUTE中的EXACT来处理:准确精准的来匹配
          */}
        <Route path='/' exact component={A}/>
        <Route path='/user' render={() => {
            //=>基于RENDER一般都是做路由权限校验
            let loginInfo = localStorage.getItem('login-info');
            if (!loginInfo) {
                return <div>暂时未登录</div>;
            }
            return <B/>;
        }}/>
        <Route path='/user/singin' component={C}/>
    </div>
</HashRouter>, window.root);
```



###  Switch

```javascript
/*
 * Switch：REACT-ROUTER中提供的一个组件，这个组件是用来约束路由的（只要有一个ROUTE的PATH被匹配到，直接渲染对应的组件，后面不管是否还能被匹配到，都不在继续渲染了，类似于SWITCH CASE中的机制）
 *
 * 真实项目中，我们一般都会在ROUTE的外面包一层SWITCH，因为加入它之后我们可以做一些处理：
 * <Switch>
       <Route path="/" exact component={Home}/>
       <Route path="/custom" component={Custom}/>

       <Route render={() => {
           return <h2>HELLO WORLD</h2>;
       }}/>

       {/*REDIRECT：重定向，重新定向到一个新的地址*/}
       <Redirect to="/"/>
       <Redirect from="" to="">
       {/* from:指定从哪个路径进来的才跳转，to:跳转到哪(字符串或对象) */}
   </Switch>
* 如果请求的地址和上面两个PATH都不匹配，则执行最后一个ROUTE（ROUTE不设置PATH，所有的路径都可以匹配），如果上面有匹配的，SWITCH会中断下面的匹配的操作（也就是下面都不在执行了）
*/
```



### Link VS NavLink

```javascript
/*
 * Link VS NavLink
 *   都是ROUTER提供的组件，用来实现组件切换的
 *
 * [Link]
 *   类似于普通的A标签，通过Link中的to可以跳转到具体的路由页面
 *   to='/'
 *   to={{
 *      pathname:'/',
 *      search:'?xxx=xxx',
 *      hash:'#xxx'
 *   }}
 *
 * [NavLink]
 *   拥有和Link相同的语法和效果，只是在Link的基础上，可以设置一些样式规则
 *   1、基于NavLink实现跳转，会给点击的元素增加一个active的样式类
 *   2、我们可以基于activeClassName / activeStyle 重新设置样式(或者样式类)
 *   3、当路由切换完成，会拿当前的HASH路径和对应的地址做匹配，把匹配到的NavLink设置对应的选中样式（和Route中的PARH路径匹配一样，对于'/'这种路径我们最好设置exact属性，精准匹配）
 */
```



### history / location / match

```javascript
/*
 * 凡是基于ROUTE路由渲染的组件，都会默认被设置三个属性
 *   基于路由渲染：<Route path='xxx' component={xxx}>
 *   获取三个属性：this.props
 *
 * history 实现路由跳转
 *   push(path, state)：向HISTORY STACK中新增一条记录（跳转到指定的新页面）
 *   replace(path, state)
 *   go(n): 
 *   goBack：返回上一条记录对应的页面
 *   goForward：前进到下一条记录对应的页面
 *   location：{pathname\search\state\hash} 存储当前页面的一些地址信息
 *   length
 *   
 *   ...
 *
 * location 存储当前页面中的一些信息
 *   pathname
 *   search
 *   hash
 *   state
 *
 * match  存储了每一个路由Route匹配的一些信息
 *   isExact
 *   params
 *   path
 *   url
 */

实现页面跳转，并且传递一些信息值，有三种方式：
1. 问号传参
    history.push(`/custom/detail?id=${id}`);  
    详情页面通过this.props.localtion.serach获取
	history.push({
        pathname: '/personal/login',
        // 问号传参
        search: '?from=home',
        // 隐形传参, 一旦页面刷新，信息就丢失了，无法基于STATE获取
        state: {
            from: 'home'
        }
    })
2. 路径参数
   history.push(`/custom/detail/${id}`);
   路由配置：<Route path='/custom/detail/:id?' component={CustomDetail}/>
   详情页面：this.props.match.params获取

3. Link传参
   <Link to={{
              pathname: `/custom/detail`,
              state: {id: id}
          }}/>
   详情页面：this.props.location.state获取
   弊端：一旦页面刷新，信息就丢失了，无法基于STATE获取
```



### WithRouter

```javascript
export default withRouter(connect(state => ({...state.custom}), action.custom)(Nav));
```



