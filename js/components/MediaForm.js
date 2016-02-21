import {Observable} from 'rx';
import {div, fieldset, label, input, select, option} from '@cycle/dom';
import {POST_URL} from '../config';

const  MediaForm = (sources) => {

	// Utils
  const isValidText = text => text.length >= 3;
  const isValidUrl = text => text.length >= 3;
  const isValidTextAllowEmpty = text => text.length >= 3;

  // retrieve the form values as an object
  const getFormValues = () => {

    let categories = [];
    const options = document.querySelector('#categories').options;
    for(let i = 0; i<options.length; i++){
      if(options[i].selected) categories.push(options[i].value);
    }

    return {
      name: document.querySelector('#name').value,
      title: document.querySelector('#title').value,
      mediaId: document.querySelector('#mediaId').value,
      postImage: document.querySelector('#postImage').value,
      description: document.querySelector('#description').value,
      type: document.querySelector('#type').value,
      rank: document.querySelector('#rank').value,
      categories: categories
    };
  };
  
  // render the form
  const renderForm = (submitEnabled) => div('.device_form',[
        fieldset([
          label('Name'),
          input('#name .field', {type:'text', placeholder: 'Media Name', autocomplete:'false'}),
          label('Title'),
          input('#title .field', {type:'text', placeholder: 'Media Name', autocomplete:'false'}),
          label('Media ID'),
          input('#mediaId .field', {type:'text', placeholder: 'Media ID', autocomplete:'false'}),
          label('Post Image'),
          input('#postImage .field', {type:'text', placeholder: 'http Image path', autocomplete:'false'}),
          label('Description'),
          input('#description .field', {type:'text', placeholder: 'Description', autocomplete:'false'}),
          label('Type'),
          select('#type .select', {value: ''}, [
          	  option({value:''}, ''),
          	  option({value:'video'}, 'Video'),
          	  option({value:'audio'}, 'Audio')
          	]),
          label('Categories'),
          select('#categories .select', {value: 'video', multiple:'multiple', size: 6, style: { height: '100%', background: 'url(data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)' }}, [
          	  option({value: 'slideshow' }, 'Slideshow'),
          	  option({value: 'premiere' }, 'Premiere'),
          	  option({value: 'top-videos' }, 'Top Videos'),
          	  option({value: 'staff-pick' }, 'Staff Pick'),
          	  option({value: 'live-performance' }, 'Live Performance'),
          	  option({value: 'original-shows' }, 'Original Shows'),
          	]),
          label('Rank'),
          input('#rank .field', {type:'text', placeholder: 'Rank', autocomplete:'false'}),

          input('.submit .button-primary', {type: 'submit', disabled: submitEnabled? false : true})
        ])
      ]);

  const submitFormClick_ = sources.DOM
    .select('.submit').events('click');
  
  const name_ = sources.DOM.select('#name').events('keyup').debounce(250).map(e => e.target.value).merge(sources.CLEAR);
  const title_ = sources.DOM.select('#title').events('keyup').debounce(250).map(e => e.target.value).merge(sources.CLEAR);
  const mediaId_ = sources.DOM.select('#mediaId').events('keyup').debounce(250).map(e => e.target.value).merge(sources.CLEAR);
  const postImage_ = sources.DOM.select('#postImage').events('keyup').debounce(250).map(e => e.target.value).merge(sources.CLEAR);
  const description_ = sources.DOM.select('#description').events('keyup').debounce(250).map(e => e.target.value).merge(sources.CLEAR);
  const type_ = sources.DOM.select('#type').events('change').debounce(250).map(e => e.target.value).merge(sources.CLEAR);
  const rank_ = sources.DOM.select('#rank').events('keyup').debounce(250).map(e => e.target.value).merge(sources.CLEAR);
  
  const formValues_ = Observable.combineLatest(name_, title_, mediaId_, postImage_, description_, type_, rank_, (name, mediaId, postImage, description, type, rank, title) =>{
      return { name, title, mediaId, postImage, description, type, rank};
    })
    .startWith({ name:"", title:"", mediaId:"", postImage:"", description:"", type:"" , rank: ""});
  
  const isFormValid_ = formValues_.map(formValues => {
    return isValidText(formValues.name) &&
           isValidText(formValues.title) &&
           isValidText(formValues.mediaId) &&
           isValidText(formValues.postImage) && 
           isValidText(formValues.description) && 
           isValidText(formValues.type)&& 
           isValidText(formValues.rank);
  }).distinctUntilChanged();
  
  const submit_ = sources.DOM.select('.submit').events('click');
  const submitClicked_ = submit_.map(() => false);
  
  
  const submitEnabled_ = isFormValid_.merge(submitClicked_).startWith(false);
  
  const sendForm_ = submit_.map(getFormValues);
  
  const addDevice_ = sendForm_
    .map((postData) => {
      return {
        url: POST_URL,
        method: 'POST',
        send: postData
      };
    });

  const vTree_ = submitEnabled_.map((submitEnabled) => renderForm(submitEnabled));
  const httpRequest_ = addDevice_;

  const sinks = {
    DOM: vTree_,
    HTTP: httpRequest_,
    CLEAR: addDevice_,
  };

  return sinks;
}


export default MediaForm;