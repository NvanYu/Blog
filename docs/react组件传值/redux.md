

## React组件间传值方案

### 1. 基于属性传值

```javascript
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

function Vote(props) {
    return (<section>
         {/* 子组件通过props对象拿到传递过来的值 */}
         props is: {props.count} 
    </section>)
}


class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {
            count:1000
        }
    }
    render() {
	  return <div>
        {/* 将要传递的值通过属性绑定到组件上 */}
        <Vote num={this.state.count}></Vote>    
      </div>
    }
}

ReactDOM.render(<Main></Main>, document.getElementbyId('root'));
```



### 2. 基于上下文传值

```javascript
// 方式一
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

class Vote extends Component {
    constructor(props) {
        super(props);
    }
    
    // 1. 获取上下文中的信息,在这个组件中想用哪个就设置哪个
    static contextTypes = {
        title: PropTypes.string,
        desc: PropTypes.string
    }
    
	render() {
        // 2. 子组件通过context对象拿到上下文中的值
        let {title, desc} = this.context;
        return (<section>
             title is: {title}, desc is: {desc}
    	</section>)
    }
}


class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: 'hello',
            desc: 'world'
        }
    }
    // 1. 设置祖先上下文需要存放的内容
    static childContextTypes = {
        title: PropTypes.string,
        desc: PropTypes.string
    }

	getChildContext() {
        // 2. 当状态改变的时候，此方法也会被触发执行，更新给后代所用的上下文信息
        return {
            title: this.state.title,
            desc: this.state.desc
        }
    }
    
    render() {
	  return <div>
        <Vote></Vote>    
      </div>
    }
}

ReactDOM.render(<Main></Main>, document.getElementbyId('root'));
```

```javascript
// 方式二
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

// 创建上下文对象
let ThemeContext = React.createContext();

class Vote extends Component {
    constructor(props) {
        super(props);
    }
    // static contextType = ThemeContext;  
	// 获取方式之一同上面的方式，基于this.context来使用即可
	render() {
        return (<ThemeContext.Consumer>
             {/* 获取方式之二，必须这样写：context作为参数的函数返回一个值 */}
             {
            	context => {
            		return <>
            			title: {context.title}, desc: {context.desc}
            		</>
        		} 
        	 }
    	</ThemeContext.Consumer>)
    }
}


class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: 'hello',
            desc: 'world'
        }
    }
    render() {
      // 通过value属性传递值 
	  return <ThemeContext.Provider value={...this.state}>
        <Vote></Vote>    
      </ThemeContext.Provider>
    }
}

ReactDOM.render(<Main></Main>, document.getElementbyId('root'));
```



### 3. 基于redux传值

redux工程化项目搭建

|-- src

​     |-- store

​           |-- index.js

​           |-- action-types.js

​           |-- actions

​           |-- reducers

#### index.js

```javascript
// index.js文件作用：创建store并导出

// 1. 导入createStore函数
import { createStore } from 'redux';
// 2. 导入reducer
import reducers from './reducers/reducer';
// 3. 创建store
let store = createStore(reducer);
// 4. 导出store
export default store;

```

#### action-types.js

```javascript
// action-types.js的作用：定义一系列action的type常量值，防止用字符串方式写错
export const VOTE_SUPPORT = 'VOTE_SUPPORT';
export const VOTE_OPPOSE = 'VOTE_OPPOSE';
```

#### reducers目录

```javascript
// reducers目录作用：分模块管理reducer并在reducer.js文件合并成一个
// 一、voteReducer.js：管理的各个模块
import * as TYPES from '../action-types';
// 1. 定义state的初始值
let initState = {
    sup: 0,
    opp:0
}
// 2. 定义并导出reducer(reducer是一个函数哦)
export default function voteReducer(state = initState, action) {
    // 3. 单项数据流，拷贝一份state，防止直接操作state
    state = JSON.parse(JSON.stringify(state));
    // 4. 根据action的type值执行不同操作
    switch(action.type) {
        case TYPES.VOTE_SUPPORT:
            state.sup++;
            break;
        case TYPES.VOTE_OPPOSE:
            state.opp++;
            break;
    }
    // 5. 不要忘了返回state
    return state;
}


// 二、reducer.js：合并各个模块
import { combineReducers } from 'redux';
import voteReducer from './voteReducer.js';
let reducer = combineReducers({
    vote: voteReducer
})
export defalut reducer;

/**
注意：合并reducer之后，state也是按照模块化方式组织的:
state = {
  vote: {   // vote模块的state
    sup,
    opp
  }
  ......其他模块的state
}
这样一来，在组件中取state方式变为: store.getState().vote.sup
*/
```

#### actions目录

```javascript
// actions目录作用：管理各个模块的action
// voteAction.js: vote模块的action
import * as TYPES from '../action-types';
let voteAction = {
    changeSup(payload) {
        return {
            type: TYPES.VOTE_SUPPORT,
	    payload
        }
    },
    changeOpp(payload) {
        return {
            type: TYPES.VOTE_OPPOSE,
	    num: payload
        }
    }
}
export default voteAction;

// action.js作用: 合并action
import voteAction from './voteAction.js';
let action = {
    vote: voteAction
}
export default action;
/**
注意：合并action之后也是按照模块化方式管理的
在根组件中导入store。可以以属性方式或上下文方式往子组件传递
如果在组件中派发，方式如下:store.dispatch(action.vote.changeSup()) // 不要忘了在组件中导入action
*/
/* 每个子组件中添加这一句
componentDidMount() {
  // 往事件池添加方法，当state状态改变后重新渲染组件
  this.props.store.subscribe(() => {
	this.forceUpdate();
  });
}
*/ 
```



### 4. 基于react-redux传值

工程化项目搭建同上，只是在组件中使用方式变得方便了一些

```javascript
// 在项目入口文件中导入store和react-redux
import { Provider } from 'react-redux';
import store from './store/index';
import App from './App';
ReactDOM.render(<Provider store={store}>
  <App />
</Provider>, document.getElementById('root'));

// 在子组件中
import { connect } from 'react-redux';
class VoteHead extends React.Component {
	render() {
		const { title, supNum, oppNum } = this.props;
		return <h4>
			{title}
			(N:{supNum + oppNum})
		</h4>;
	}
}
/*
 *  connect高阶组件
 *     connect(mapStateToProps,mapDispatchToProps)
 *  而且帮助我们做了一件事情：基于subscribe向事件池中追加了重新渲染当前组件的方法
 */
/* function mapStateToProps(state) {
	// state => store.getState()：获取容器中的公共状态
	return {
		// 返回谁就把谁当做属性传递给组件
		// title: state.vote.title,
		// supNum: state.vote.supNum
		...state.vote
	}
} */
export default connect(state => state.vote)(VoteHead);


class VoteFoote extends React.Component {
	render() {
		let { changeSupNum, changeOppNum } = this.props;
		return <>
			<button onClick={ev => {
				changeSupNum();
			}}>支持</button>
			<button onClick={ev => {
				changeOppNum();
			}}>反对</button>
		</>;
	}
}
export default connect(null, action.vote)(VoteFoote);

// react-redux帮我们把action-creators变为派发的形式 
/* function mapDispatchToProps(dispatch) {
	//dispatch => store.dispatch
	return {
		changeSupNum() {
			dispatch(action.vote.changeSupNum());
		},
		changeOppNum() {
			dispatch(action.vote.changeOppNum());
		}
	}
} */
```

