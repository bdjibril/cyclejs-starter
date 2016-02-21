import {Observable} from 'rx';
import {div, hr, makeDOMDriver} from '@cycle/dom';
import MediaGrid from './MediaGrid';
import MediaForm from './MediaForm';

const App = (sources) => {

  // The Grid Component
  const mediaGridComponent = MediaGrid({DOM: sources.DOM, HTTP: sources.HTTP});
  const mediaGridComponentVTree_ = mediaGridComponent.DOM;

  // The Form Component
  const mediaFormComponent = MediaForm({DOM: sources.DOM, HTTP: sources.HTTP, CLEAR: sources.CLEAR});
  const mediaFormComponentVTree_ = mediaFormComponent.DOM;

  // Merge all the requests to send
  const httpRequest_ = Observable.merge(mediaGridComponent.HTTP, mediaFormComponent.HTTP);

  // Form clear
  const clear_ = mediaFormComponent.CLEAR;
  
  // Build the vtree from all the components
  const vtree_ = Observable.combineLatest(mediaGridComponentVTree_, mediaFormComponentVTree_, (mediaGridComponentVTree, mediaFormComponentVTree) =>
    div('.container', [
      mediaGridComponentVTree,
      hr(),
      mediaFormComponentVTree
    ])
  );

  const sinks = {
    DOM: vtree_,
    HTTP: httpRequest_,
    CLEAR: clear_
  };

  return sinks;
}

export default App;
