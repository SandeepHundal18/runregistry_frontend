import axios from 'axios';
import { api_url } from '../../../config/config';
import { error_handler } from '../../../utils/error_handlers';
import auth from '../../../auth/auth';
import stringify from 'json-stringify-pretty-compact';
import { editClassifierIntent } from '../../classifier_editor';
const FETCH_DATASET_CLASSIFIER = 'FETCH_DATASET_CLASSIFIER-OFFLINE';
const EDIT_DATASET_CLASSIFIER = 'EDIT_DATASET_CLASSIFIER-OFFLINE';

export const fetchDatasetClassifier = () =>
    error_handler(async dispatch => {
        const { data: classifiers } = await axios.get(
            `${api_url}/classifiers/offline_dataset`
        );
        const classifier = classifiers[0];
        dispatch({ type: FETCH_DATASET_CLASSIFIER, payload: classifier });
        return classifier;
    });

export const editDatasetClassifier = (new_classifier, class_selected) =>
    error_handler(async (dispatch, getState) => {
        const { data: classifier } = await axios.put(
            `${api_url}/classifiers/offline_dataset/${new_classifier.id}`,
            { ...new_classifier, class: class_selected },
            auth(getState)
        );
        dispatch({
            type: EDIT_DATASET_CLASSIFIER,
            payload: classifier
        });
    });

const INITIAL_STATE = {};

export default function(state = INITIAL_STATE, action) {
    const { type, payload } = action;
    switch (type) {
        case FETCH_DATASET_CLASSIFIER:
            return payload;
        case EDIT_DATASET_CLASSIFIER:
            return payload;
        default:
            return state;
    }
}
