import {run} from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {makeHTTPDriver} from '@cycle/http';
import {makeInputClearDriver} from './drivers/input';
import App from './components/App';

run(App, 
	{
		DOM: makeDOMDriver('#root'),
		HTTP: makeHTTPDriver(),
		CLEAR: makeInputClearDriver(['.field'])
	}
);
