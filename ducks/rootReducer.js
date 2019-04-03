import { combineReducers } from 'redux';
import online from './online/index';
import offline from './offline/index';
import info from './info';
import global_ui from './global_ui';
import classifier_editor from './classifier_editor';

const rootReducer = combineReducers({
    info,
    online,
    offline,
    classifier_editor,
    global_ui
});

export default rootReducer;
