import React, { Component } from 'react';
import { connect } from 'react-redux';
import Router, { withRouter } from 'next/router';
import { Icon } from 'antd';
import Swal from 'sweetalert2';
import qs from 'qs';
import { offline_columns } from '../../../config/config';

import {
    moveDataset,
    filterDatasets,
    changeFilters
} from '../../../ducks/offline/datasets';
import {
    toggleTableFilters,
    showManageDatasetModal,
    showLumisectionModal
} from '../../../ducks/offline/ui';
import ManageDatasetModal from '../manage_dataset/ManageDatasetModal';
import LumisectionModal from '../lumisections/LumisectionModal';

import ReactTable from 'react-table';

const column_filter_description = {
    string: '=, like, notlike, <>',
    date: '>, <, >=, <=, <>',
    component: '=, like, notlike, <>',
    boolean: 'true, false'
};
const column_types = {
    'hlt_key.value': 'string',
    'class.value': 'string',
    run_number: 'integer',
    class: 'string',
    significant: 'boolean',
    'state.value': 'string',
    b_field: 'integer',
    start_time: 'date',
    hlt_key: 'string',
    duration: 'integer',
    clock_type: 'string',
    component: 'component'
};
const defaultPageSize = 25;
let local_sortings = [];

class RunTable extends Component {
    // First time page loads, table grabs filter from query url, then goes and queries them:
    async componentDidMount() {
        let { url_filter } = this.props.dataset_table;
        const renamed_filters = rename_triplets(url_filter, true);
        const filters = formatFilters(renamed_filters);
        await this.props.filterDatasets(defaultPageSize, 0, [], filters);
    }
    // When a user filters the table, the filters are persisted in the url string, this method takes care of that:
    applyFiltersToUrl = filters => {
        const object_filter = {};
        // Turn array filter into object:
        filters.forEach(filter => {
            object_filter[filter.id] = filter.value;
        });
        let { pathname, asPath } = this.props.router;
        const query = qs.stringify(object_filter);
        if (asPath.includes('?')) {
            pathname = pathname.split('?')[0];
            asPath = asPath.split('?')[0];
        }
        // Change filters in redux and in route:
        this.props.changeFilters(filters, object_filter);
        Router.push(`${pathname}?${query}`, `${asPath}?${query}`, {
            shallow: true
        });
        return filters;
    };
    // When a user filters the table, it goes and applies the filters to the url, then it filters the runs
    filterTable = async (filters, page, pageSize) => {
        this.applyFiltersToUrl(filters);
        const renamed_filters = rename_triplets(filters, true);
        const formated_filters = formatFilters(renamed_filters);
        await this.props.filterDatasets(
            pageSize || defaultPageSize,
            page,
            [],
            formated_filters
        );
    };

    // Navigate entirely to a route without filters (when clicking remove filters)
    removeFilters = () => {
        let { asPath } = this.props.router;
        if (asPath.includes('?')) {
            asPath = asPath.split('?')[0];
        }
        window.location.href = `${window.location.origin}${asPath}`;
    };

    // When a user sorts by any field, we want to preserve the filters:
    sortTable = async (sortings, page, pageSize) => {
        let { url_filter } = this.props.dataset_table;
        const renamed_filters = rename_triplets(url_filter, true);
        const formated_filters = formatFilters(renamed_filters);
        const renamed_sortings = rename_triplets(sortings, false);
        const formated_sortings = formatSortings(renamed_sortings);
        await this.props.filterDatasets(
            pageSize || defaultPageSize,
            page,
            formated_sortings,
            formated_filters
        );
    };
    onPageChange = async page => {
        this.sortTable(local_sortings, page);
    };
    onPageSizeChange = async (newSize, page) => {
        this.sortTable(local_sortings, page, newSize);
    };

    render() {
        const {
            filterable,
            workspace,
            dataset_table,
            moveDataset,
            showManageDatasetModal,
            showLumisectionModal
        } = this.props;
        const { datasets, pages, loading, filter, filters } = dataset_table;
        let columns = [
            {
                Header: 'Run Number',
                accessor: 'run_number',
                maxWidth: 90,
                resizable: false,
                Cell: ({ original, value }) => (
                    <div style={{ textAlign: 'center', width: '100%' }}>
                        <a onClick={() => showManageDatasetModal(original)}>
                            {value}
                        </a>
                    </div>
                )
            },
            { Header: 'Dataset Name', accessor: 'name', maxWidth: 250 },
            {
                Header: 'Class',
                accessor: 'class',
                maxWidth: 90,
                Cell: ({ value }) => (
                    <div style={{ textAlign: 'center' }}>{value.value}</div>
                )
            },
            {
                Header: 'Manage / LS',
                id: 'manage',
                filterable: false,
                sortable: false,
                maxWidth: 75,
                Cell: ({ original }) => (
                    <div style={{ textAlign: 'center' }}>
                        <span>
                            <a onClick={() => showManageDatasetModal(original)}>
                                Manage
                            </a>
                            {' / '}
                        </span>
                        <a onClick={evt => showLumisectionModal(original)}>
                            LS
                        </a>
                    </div>
                )
            },
            {
                Header: 'Appeared In',
                id: 'appeared_in',
                accessor: 'appeared_in',
                maxWidth: 150,
                Cell: ({ original, value }) => (
                    <div style={{ textAlign: 'center' }}>
                        <span
                            style={{
                                fontSize: '0.95em',
                                fontWeight: 'bold',
                                borderRadius: '1px'
                            }}
                        >
                            <span style={{ padding: '4px' }}>
                                {value.value}
                            </span>
                        </span>
                    </div>
                )
            },
            {
                Header: `${workspace} State`,
                id: 'state',
                accessor: `${workspace.toLowerCase()}_state`,
                minWidth: 145,
                maxWidth: 145,
                Cell: ({ original, value }) => (
                    <div style={{ textAlign: 'center' }}>
                        <span
                            style={{
                                color: 'white',
                                fontSize: '0.95em',
                                fontWeight: 'bold',
                                color: value.value === 'OPEN' ? 'red' : 'grey',
                                borderRadius: '1px'
                            }}
                        >
                            <span style={{ padding: '4px' }}>
                                {value.value}
                            </span>
                        </span>
                        {' / '}
                        <a
                            onClick={async () => {
                                let options = {
                                    OPEN: 'To OPEN',
                                    SIGNOFF: 'to SIGNOFF',
                                    COMPLETED: 'to COMPLETED'
                                };

                                if (value.value === 'waiting dqm gui') {
                                    options = { OPEN: 'To OPEN' };
                                }
                                delete options[value.value];
                                const { value: state } = await Swal({
                                    title: `Move dataset manually ${
                                        original.name
                                    } of run ${original.run_number} to...`,
                                    input: 'select',
                                    inputOptions: options,
                                    showCancelButton: true,
                                    reverseButtons: true
                                });
                                if (state) {
                                    await moveDataset(
                                        original.id,
                                        workspace.toLowerCase(),
                                        state
                                    );
                                    await Swal(
                                        `Dataset ${original.name} of run ${
                                            original.run_number
                                        } Moved to ${state}`,
                                        '',
                                        'success'
                                    );
                                }
                            }}
                        >
                            move
                        </a>
                    </div>
                )
            },
            { Header: 'Dataset Created', accessor: 'createdAt', maxWidth: 150 }
        ];
        // {
        //     Header: 'Hlt Key Description',
        //     accessor: 'hlt_key'
        // },
        // {
        //     Header: 'GUI',
        //     filterable: false,
        //     maxWidth: 50,
        //     Cell: ({ original }) => (
        //         <div style={{ textAlign: 'center' }}>
        //             <a
        //                 target="_blank"
        //                 href={`https://cmsweb.cern.ch/dqm/offline/start?runnr=${
        //                     original.run_number
        //                 };sampletype=offline_data;workspace=Summary`}
        //             >
        //                 GUI
        //             </a>
        //         </div>
        //     )
        // }

        // Put components in format Header: component
        let offline_columns_composed = offline_columns
            .filter(column => {
                if (workspace === 'global') {
                    return !column.includes('_');
                }
                return column.startsWith(workspace.toLowerCase());
            })
            .map(column => ({
                // Header: column.split('_').join(' ')
                Header: column
            }));
        offline_columns_composed = offline_columns_composed.map(column => {
            return {
                ...column,
                maxWidth: 66,
                id: column.Header,
                accessor: data => {
                    let status = 'EXCLUDED';
                    const triplet = data[column.Header];
                    if (triplet) {
                        status = triplet.status;
                    }
                    return status;
                },
                Cell: props => {
                    const { value } = props;
                    return (
                        <span
                            style={{
                                width: '100%',
                                height: '100%',
                                textAlign: 'center'
                            }}
                        >
                            {value === 'GOOD' && (
                                <div
                                    style={{
                                        backgroundColor: 'green',
                                        borderRadius: '1px'
                                    }}
                                >
                                    <span
                                        style={{
                                            color: 'white'
                                        }}
                                    >
                                        GOOD
                                    </span>
                                </div>
                            )}
                            {value === 'EXCLUDED' && (
                                <div
                                    style={{
                                        backgroundColor: 'grey',
                                        borderRadius: '1px'
                                    }}
                                >
                                    <span
                                        style={{
                                            color: 'white',
                                            fontSize: '0.85em'
                                        }}
                                    >
                                        EXCLUDED
                                    </span>
                                </div>
                            )}
                            {value === 'BAD' && (
                                <div
                                    style={{
                                        backgroundColor: 'red',
                                        borderRadius: '1px'
                                    }}
                                >
                                    <span
                                        style={{
                                            color: 'white'
                                        }}
                                    >
                                        BAD
                                    </span>
                                </div>
                            )}
                            {value === 'STANDBY' && (
                                <div
                                    style={{
                                        backgroundColor: 'yellow',
                                        borderRadius: '1px'
                                    }}
                                >
                                    <span
                                        style={{
                                            color: 'black'
                                        }}
                                    >
                                        STANDBY
                                    </span>
                                </div>
                            )}
                            {value === 'NOTSET' && (
                                <div
                                    style={{
                                        backgroundColor: 'white',
                                        borderRadius: '1px'
                                    }}
                                >
                                    <span
                                        style={{
                                            color: 'black'
                                        }}
                                    >
                                        NOTSET
                                    </span>
                                </div>
                            )}
                        </span>
                    );
                }
            };
        });
        columns = [...columns, ...offline_columns_composed];
        // columns = component_columns;
        columns = columns.map(column => {
            return {
                ...column,
                Header: () => (
                    <div>
                        {column.Header}
                        &nbsp;&nbsp;
                        <Icon
                            onClick={() => this.props.toggleTableFilters()}
                            type="search"
                            style={{ fontSize: '10px' }}
                        />
                    </div>
                ),
                Filter: ({ column, onChange }) => {
                    const { id } = column;
                    const type = column_types[id] || 'string';
                    const style = `
                        text-align: left;
                        border: 1px solid grey;
                        white-space: pre-wrap;
                        transition: all 1s;
                        margin-left: -10px;
                        margin-top: 20px;
                        padding: 9px;
                        width: 200px;
                        z-index: 900;
                        height: 270px;
                        background: white;
                        position: fixed;
                        display: none;`;
                    return (
                        <div
                            className="filter_selector"
                            style={{ zIndex: 999 }}
                        >
                            <input
                                defaultValue={filters[column.id]}
                                onMouseEnter={evt => {
                                    const block = document.querySelector(
                                        `#${column.id}`
                                    );
                                    block.setAttribute(
                                        'style',
                                        `${style} display: inline-block;`
                                    );
                                }}
                                onMouseLeave={({ clientX, clientY }) => {
                                    const block = document.querySelector(
                                        `#${column.id}`
                                    );
                                    block.setAttribute('style', style);
                                }}
                                type="text"
                                onKeyPress={evt => {
                                    if (evt.key == 'Enter') {
                                        onChange(evt.target.value);
                                    }
                                }}
                                style={
                                    { width: '100%' } // onChange={evt => onChange(evt.target.value)}
                                }
                            />
                            <div style={{ display: 'none' }} id={column.id}>
                                <h3
                                    style={{
                                        textTransform: 'capitalize'
                                    }}
                                >
                                    {type} filter
                                </h3>
                                Supported operators:{' '}
                                {column_filter_description[type]}
                                <p />
                                <p>Structure:</p>
                                <p>
                                    <i>operator</i> value <i>and/or</i>{' '}
                                    <i>operator</i> value
                                </p>
                                <p>Examples:</p>
                                <p>
                                    <i>{'='}</i> 322433
                                </p>
                                <p>
                                    <i>{'>'}</i> 40 <i>and</i> <i>{'<'}</i> 100{' '}
                                    <i>or</i> <i>{'>'}</i> 500
                                </p>
                                <p>
                                    <i>{'like'}</i> %physics% <i>and</i>{' '}
                                    <i>{'like'}</i> %2018%
                                </p>
                                <p>
                                    <strong>
                                        {
                                            'Space between operator and value is mandatory'
                                        }
                                    </strong>
                                </p>
                            </div>
                        </div>
                    );
                }
            };
        });
        return (
            <div>
                <ManageDatasetModal />
                <LumisectionModal />
                Hold <i>shift</i> for multiple column sorting. <br />A dataset
                must appear in DQM GUI for it to be editable (although it can be
                moved manually by clicking 'move').
                {filter && (
                    <div
                        style={{
                            width: '100%',
                            backgroundColor: 'rgba(1,0.1,0.1,0.1)'
                        }}
                    >
                        <h3
                            style={{
                                color: 'red',
                                display: 'inline-block',
                                marginBottom: 0
                            }}
                        >
                            Filter/Sorting are ON
                        </h3>
                        {'    -    '}
                        <a onClick={this.removeFilters}>
                            Click here to remove filters and sortings
                        </a>
                    </div>
                )}
                <ReactTable
                    columns={columns}
                    manual
                    data={
                        datasets // Forces table not to paginate or sort automatically, so we can handle it server-side
                    }
                    pages={pages}
                    loading={
                        loading // Display the total number of pages
                    }
                    onPageChange={page => {
                        this.onPageChange(page);
                    }}
                    onPageSizeChange={(pageSize, page) =>
                        this.onPageSizeChange(pageSize, page)
                    }
                    onFilteredChange={(filtered, column, table) => {
                        // 0 is for first page
                        this.filterTable(filtered, 0);
                    }}
                    onSortedChange={sortings => {
                        local_sortings = sortings;
                        // 0 is for first page
                        this.sortTable(sortings, 0);
                    }}
                    filterable={filterable}
                    defaultPageSize={
                        defaultPageSize // Request new data when things change
                    }
                    className="-striped -highlight"
                />
                <br />
                <style jsx global>{`
                    .ReactTable .rt-th,
                    .ReactTable .rt-td {
                        font-size: 11px;
                        padding: 3px 3px !important;
                    }
                `}</style>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        filterable: state.offline.ui.table.filterable,
        dataset_table: state.offline.datasets,
        workspace: state.offline.workspace.workspace
    };
};

// SQL Understands a dot syntax for JSONB values (in this case triplets), they are transformed to this syntax in this function
// filtering is true if the user is trying to filter, not to sort
const rename_triplets = (original_criteria, filtering) => {
    return original_criteria.map(filter => {
        const new_filter = { ...filter };
        if (
            filter.id === 'state' ||
            filter.id === 'significant' ||
            filter.id === 'class' ||
            filter.id === 'hlt_key' ||
            filter.id === 'hlt_physics_counter' ||
            filter.id === 'appeared_in'
        ) {
            new_filter.id = `${filter.id}.value`;
            // If its just sorting no need for upper case, but if its filtering yes (because in back end they are stored uppercase):
            if (filtering && filter.id === 'state') {
                new_filter.value = filter.value.toUpperCase();
            }
        }
        if (filter.id.includes('_triplet')) {
            new_filter.id = `${filter.id}.status`;
            if (filtering) {
                new_filter.value = filter.value.toUpperCase();
            }
        }
        return new_filter;
    });
};

const formatFilters = original_filters => {
    const column_filters = {};
    original_filters.forEach(({ id, value }) => {
        value = value.trim().replace(/ +/g, ' '); // Replace more than one space for 1 space
        const criteria = value.split(' ').filter(arg => arg !== '');
        let query = {};
        if (criteria.length === 1) {
            // If user types '=' or '<' alike operator, do not perform default 'like' or '=':
            if (['=', '<', '>', '<=', '>='].includes(criteria[0][0])) {
                const operator = criteria[0][0];
                criteria[0] = criteria[0].substring(1);
                criteria.unshift(operator);
            } else if (column_types[id] === 'string') {
                // If it is a string, default is like:
                criteria[0] = `%${criteria[0]}%`;
                criteria.unshift('like');
            } else {
                // Else, default is operator '='
                criteria.unshift('=');
            }
        }
        // Format And/Or up to three levels:
        if (criteria.length === 2) {
            query = { [criteria[0]]: criteria[1] };
        }
        if (criteria.length === 5) {
            query = {
                [criteria[2]]: [
                    { [criteria[0]]: criteria[1] },
                    { [criteria[3]]: criteria[4] }
                ]
            };
        }
        if (criteria.length === 8) {
            query = {
                [criteria[5]]: [
                    { [criteria[6]]: criteria[7] },
                    {
                        [criteria[2]]: [
                            { [criteria[0]]: criteria[1] },
                            { [criteria[3]]: criteria[4] }
                        ]
                    }
                ]
            };
        }
        // If query is blank, there was an error in query format
        if (Object.keys(query).length === 0) {
            throw 'query invalid';
        }
        column_filters[id] = query;
    });
    return column_filters;
};

const formatSortings = original_sortings => {
    return original_sortings.map(sorting => [
        sorting.id,
        sorting.desc ? 'DESC' : 'ASC'
    ]);
};

export default withRouter(
    connect(
        mapStateToProps,
        {
            filterDatasets,
            toggleTableFilters,
            showManageDatasetModal,
            showLumisectionModal,
            changeFilters,
            moveDataset
        }
    )(RunTable)
);
