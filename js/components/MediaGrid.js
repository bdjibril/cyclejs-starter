import {Observable} from 'rx';
import {div, table, thead, th, tbody, tr, td, img, button} from '@cycle/dom';
import {POST_URL, POST_FILTERS} from '../config';

const  MediaGrid = (sources) => {

	// Render the posts rows
  const renderPosts = (posts) => {
    return posts.map(post =>  tr([
            td(post.name),
            td(post.mediaId),
            td([
              img({src: post.postImage, width: 25, height: 25})]),
            td((post.description)?(post.description.length < 40)?post.description:`${post.description.substring(0,40)}...`:''),
            td(post.type),
            td(`${post.rank}`),
            td([button(`#delete-${post.id} .server-delete .button-outline .button-red .button-small`, 'Delete')])
          ])
        );
  };
  
  // render the table
  const renderTable = (posts) => table('.post_table', [
        thead('.table-header', [
          tr([
            th('Name'),
            th('Media Id'),
            th('Post Image'),
            th('Description'),
            th('Type'),
            th('Rank'),
            th('')
          ])
        ]),
        tbody('.table-body', renderPosts(posts)
        )
      ]);

  const devicesFormResponse_ = sources.HTTP
    .filter(res_ => res_.request.url.indexOf(POST_URL) === 0 && res_.request.method === 'POST')
    .mergeAll()
    .map(res => res.body)
    .startWith({});

  const deviceDeleteResponse_ = sources.HTTP
    .filter(res_ => res_.request.url.indexOf(POST_URL) === 0 && res_.request.method === 'DELETE')
    .mergeAll()
    .map(res => res.body)
    .startWith({});
  
  const initialDevicesFetch_ = Observable.just(null);

  const fetchDevicesClick_ = sources.DOM
    .select('.fetch-devices').events('click')
    .throttle(5000);
  
  const getDevices_ = Observable.merge(initialDevicesFetch_, fetchDevicesClick_, deviceDeleteResponse_, devicesFormResponse_)
    .map(() => {
      return {
        url: `${POST_URL}${POST_FILTERS}`,
        method: 'GET'
      };
    });

  const deleteDeviceBtnClick_ = sources.DOM.select('.server-delete').events('click').map(e => e.target.id.replace('delete-',''));

  const deleteDevice_ = deleteDeviceBtnClick_
    .map(id => {
      return {
        url: `${POST_URL}/${id}`,
        method: 'DELETE'
      };
    });

  const posts_ = sources.HTTP
    .filter(res_ => res_.request.url.indexOf(POST_URL) === 0 && res_.request.method === 'GET' )
    .mergeAll()
    .map(res => res.body)
    .startWith([]);

  const vTree_ = posts_.map((posts) => div([
      button('.fetch-devices .button-outline', 'Refresh Media'),
      renderTable(posts)
    ]) );

  const httpRequest_ = getDevices_.merge(deleteDevice_);


  const sinks = {
    DOM: vTree_,
    HTTP: httpRequest_
  };

  return sinks;
}


export default MediaGrid;