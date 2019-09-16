import axios from 'axios';

import { api_url } from '../../config/config';
import auth from '../../auth/auth';
import { error_handler } from '../../utils/error_handlers';
import { hideManageRunModal } from './ui';
export const EDIT_RUN = 'EDIT_RUN';
const FILTER_RUNS = 'FILTER_RUNS';
const INITIALIZE_FILTERS = 'INITIALIZE_FILTERS';

export const initializeFiltersFromUrl = ({ store, query }) => {
    const { filters } = query;
    if (filters) {
        if (Object.keys(filters).length > 0) {
            store.dispatch({
                type: INITIALIZE_FILTERS,
                payload: Object.keys(filters).map(key => ({
                    id: key,
                    value: filters[key]
                })),
                filters,
                from_url: true
            });
            store.dispatch(toggleTableFilters());
        }
    }
};

export const filterRuns = (page_size, page, sortings, filtered) =>
    error_handler(async (dispatch, getState) => {
        const { data: runs } = await axios.post(
            `${api_url}/runs_filtered_ordered`,
            { page, page_size, sortings, filter: filtered },
            auth(getState)
        );
        runs.runs = formatRuns(runs.runs);
        dispatch({
            type: FILTER_RUNS,
            payload: runs
        });
    });

export const editRun = (run_number, updated_run) =>
    error_handler(async (dispatch, getState) => {
        let { data: run } = await axios.put(
            `${api_url}/manual_run_edit/${run_number}`,
            updated_run,
            auth(getState)
        );
        run = formatRuns([run])[0];
        dispatch({ type: EDIT_RUN, payload: run });
        dispatch(hideManageRunModal());
    });

export const markSignificant = original_run =>
    error_handler(async (dispatch, getState) => {
        let { data: run } = await axios.post(
            `${api_url}/runs/mark_significant`,
            { original_run },
            auth(getState)
        );
        run = formatRuns([run])[0];
        dispatch({ type: EDIT_RUN, payload: run });
    });

export const moveRun = (original_run, from_state, to_state) =>
    error_handler(async (dispatch, getState) => {
        let { data: run } = await axios.post(
            `${api_url}/runs/move_run/${from_state}/${to_state}`,
            { original_run, to_state },
            auth(getState)
        );
        run = formatRuns([run])[0];
        dispatch({ type: EDIT_RUN, payload: run });
    });

// refreshRun will refresh the lumisections inside the run from OMS
export const refreshRun = run_number =>
    error_handler(async (dispatch, getState) => {
        let { data: run } = await axios.post(
            `${api_url}/runs/refresh_run/${run_number}`,
            {},
            auth(getState)
        );
        run = formatRuns([run])[0];
        dispatch({ type: EDIT_RUN, payload: run });
        return run;
    });

// reFetch run will just refetch a run
export const reFetchRun = run_number =>
    error_handler(async (dispatch, getState) => {
        let { data: run } = await axios.get(
            `${api_url}/runs/${run_number}`,
            {},
            auth(getState)
        );
        run = formatRuns([run])[0];
        dispatch({ type: EDIT_RUN, payload: run });
        return run;
    });

const INITIAL_STATE = {
    runs: []
};

export default function(state = INITIAL_STATE, action) {
    const { type, payload } = action;
    switch (type) {
        case FILTER_RUNS:
            return {
                ...state,
                runs: payload.runs,
                pages: payload.pages,
                count: payload.count
            };
        case EDIT_RUN:
            return { ...state, runs: editRunHelper(state.runs, payload) };
        default:
            return state;
    }
}

const findId = (array, run_number) => {
    for (let i = 0; i < array.length; i++) {
        if (array[i].run_number === run_number) {
            return i;
        }
    }
};

const editRunHelper = (runs, new_run) => {
    const index = findId(runs, new_run.run_number);
    if (typeof index !== 'undefined') {
        return [...runs.slice(0, index), new_run, ...runs.slice(index + 1)];
    }
    return runs;
};

const formatRuns = runs => {
    return runs.map(run => ({
        ...run.oms_attributes,
        ...run.rr_attributes,
        ...run,
        triplet_summary: run.DatasetTripletCache
            ? run.DatasetTripletCache.triplet_summary
            : {}
    }));
};
