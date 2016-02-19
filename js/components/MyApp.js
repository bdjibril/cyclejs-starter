import {Observable} from 'rx';
import {div, button, h1, h4, a, table, thead, th, tbody, tr, td, form, fieldset, label, input,hr, makeDOMDriver} from '@cycle/dom';


function MyApp(sources) {
  
  // Utils
  const isValidServerName = name => name.length >= 3;
  const isValidIp = ip => ip.length >= 3;
  const isValidUsername = username => username.length >= 3;
  const isValidPassword = password => password.length >= 3;

  // retrieve the form values as an object
  const getFormValues = () =>{
    return {
      serverName: document.querySelector('#serverName').value,
      ipAddress: document.querySelector('#ipAddress').value,
      username: document.querySelector('#username').value,
      password: document.querySelector('#password').value
    };
  };
  
  
  // Render the devices rows
  const renderDevices = (devices) => {
    return devices.map(device =>  tr([
            td(device.name),
            td(device.ipAddress),
            td(device.username),
            td(device.password),
            td(device.status),
            td([button(`#delete-${device.id} .server-delete .button-outline .button-red .button-small`, 'Delete')])
          ])
        );
  };
        
 
  // render the table
  const renderTable = (devices) => table('.device_table', [
        thead('.table-header', [
          tr([
            th('Name'),
            th('IP Address'),
            th('Username'),
            th('Password'),
            th('Status'),
            th('')
          ])
        ]),
        tbody('.table-body', renderDevices(devices)
        )
      ]);
  
  // render the form
  const renderForm = (submitEnabled) => div('.device_form',[
        fieldset([
          label('Server Name'),
          input('#serverName .field', {type:'text', placeholder: 'Server Name', autocomplete:'false'}),
          label('IP Address'),
          input('#ipAddress .field', {type:'text', placeholder: 'IP Address', autocomplete:'false'}),
          label('Username'),
          input('#username .field', {type:'text', placeholder: 'root/admin Username', autocomplete:'false'}),
          input('.fakeinputforChrome', {type:'text', autocomplete:'false', style:{display: 'none'}}),
          input('.fakeinputforChrome', {type:'password', autocomplete:'false', style:{display: 'none'}}),
          label('Password'),
          input('#password .field', {type:'password', placeholder: 'root/admin Password', autocomplete:'false'}),

          input('.submit .button-primary', {type: 'submit', disabled: submitEnabled? false : true})
        ])
      ]);
  
  const DEVICES_URL = 'https://demo9712149.mockable.io/servers';


  const submitFormClick_ = sources.DOM
    .select('.submit').events('click');
  
  const devices_ = sources.HTTP
    .filter(res_ => res_.request.url.indexOf(DEVICES_URL) === 0 && res_.request.method === 'GET' )
    .mergeAll()
    .map(res => res.body)
    .startWith([]);
  
  const devicesFormResponse_ = sources.HTTP
    .filter(res_ => res_.request.url.indexOf(DEVICES_URL) === 0 && res_.request.method === 'POST')
    .mergeAll()
    .map(res => res.body)
    .startWith(null);

  const deviceDeleteResponse_ = sources.HTTP
    .filter(res_ => res_.request.url.indexOf(DEVICES_URL) === 0 && res_.request.method === 'DELETE')
    .mergeAll()
    .map(res => res.body)
    .startWith(null);
  
  const initialDevicesFetch_ = Rx.Observable.just(null);
  const fetchDevicesClick_ = sources.DOM
    .select('.fetch-devices').events('click')
    .throttle(5000);
  
  const getDevices_ = Rx.Observable.merge(initialDevicesFetch_, fetchDevicesClick_, deviceDeleteResponse_, devicesFormResponse_)
    .map(() => {
      return {
        url: DEVICES_URL,
        method: 'GET'
      };
    });
  
  const serverName_ = sources.DOM.select('#serverName').events('keyup').debounce(250).map(e => e.target.value).merge(sources.CLEAR);
  const ipAddress_ = sources.DOM.select('#ipAddress').events('keyup').debounce(250).map(e => e.target.value).merge(sources.CLEAR);
  const username_ = sources.DOM.select('#username').events('keyup').debounce(250).map(e => e.target.value).merge(sources.CLEAR);
  const password_ = sources.DOM.select('#password').events('keyup').debounce(250).map(e => e.target.value).merge(sources.CLEAR);
  
  const formValues_ = Rx.Observable.combineLatest(serverName_, ipAddress_, username_, password_, (serverName, ipAddress, username, password) =>{
      return {serverName, ipAddress, username, password};
    })
    .startWith({
      serverName: "",
      ipAddress: "",
      username: "",
      password: ""
    });
  
  const isFormValid_ = formValues_.map(formValues => {
    return isValidServerName(formValues.serverName) && 
           isValidIp(formValues.ipAddress) &&
           isValidUsername(formValues.username) && 
           isValidPassword(formValues.password);
  }).distinctUntilChanged();
  
  const submit_ = sources.DOM.select('.submit').events('click');
  const submitClicked_ = submit_.map(() => false);
  
  
  const submitEnabled_ = isFormValid_.merge(submitClicked_).startWith(false);
  
  const sendForm_ = submit_.map(getFormValues);
  
  const addDevice_ = sendForm_
    .map((deviceData) => {
      return {
        url: DEVICES_URL,
        method: 'POST',
        send: deviceData
      };
    });

  const deleteDeviceBtnClick_ = sources.DOM.select('.server-delete').events('click').map(e => e.target.id);

  const deleteDevice_ = deleteDeviceBtnClick_
    .map(id => {
      id = 1;
      return {
        url: `${DEVICES_URL}/${id}`,
        method: 'DELETE'
      };
    });

  // Merge all the requests to send
  const httpRequest_ = getDevices_.merge(addDevice_).merge(deleteDevice_);
  
  const vtree_ = Rx.Observable.combineLatest(devices_, formValues_, submitEnabled_, (devices, formValues, submitEnabled) =>
    div('.container', [
      button('.fetch-devices .button-outline', 'Refresh Devices'),
      renderTable(devices),
      hr(),
      renderForm(submitEnabled)
    ])       
  );

  return {
    DOM: vtree_,
    HTTP: httpRequest_,
    CLEAR: devicesFormResponse_
  };
}

export default MyApp;
