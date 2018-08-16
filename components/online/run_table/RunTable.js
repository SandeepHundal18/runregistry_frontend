import React, { Component } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { render } from 'react-dom';
import { Icon } from 'antd';
import _ from 'lodash';
import { components } from '../../../config/config';
import { filterRuns } from '../../../ducks/online/runs';
import {
    toggleTableFilters,
    showManageRunModal
} from '../../../ducks/online/ui';
import ManageRunModal from '../manage_run/ManageRunModal';
// import runs from '../../../ducks/runs.json';

// Import React Table
import ReactTable from 'react-table';

class App extends Component {
    fetchData = (table, instance) => {
        // Whenever the table model changes, or the user sorts or changes pages, this method gets called and passed the current table model.
        // You can set the `loading` prop of the table to true to use the built-in one or show you're own loading bar if you want.
        this.setState({ loading: true });
        // Request the data however you want.  Here, we'll use our mocked service we created earlier
        this.props.filterRuns(
            table.pageSize,
            table.page,
            table.sorted,
            table.filtered
        );
    };
    render() {
        // const { data, pages, loading } = this.state;
        const { filterable, run_table, showManageRunModal } = this.props;
        const { runs, pages, loading } = run_table;
        let columns = [
            {
                Header: 'Run Number',
                accessor: 'run_number',
                Cell: props => {
                    return (
                        <div style={{ textAlign: 'center', width: '100%' }}>
                            <a onClick={evt => console.log(evt.target)}>
                                {props.value}
                            </a>
                        </div>
                    );
                }
            },
            {
                Header: 'Manage',
                id: 'manage',
                Cell: () => (
                    <div>
                        <a>Manage</a>
                    </div>
                )
            },
            { Header: 'Started', accessor: 'start_time' },
            { Header: 'Hlt Key Description', accessor: 'hlt_key' },
            { Header: 'Class', accessor: 'class' }
        ]; // { Header: 'Stopped', accessor: 'STOPTIME' },];

        const other_columns = [
            // { Header: 'LHC Fill', accessor: 'LHCFILL' }, // { Header: 'B1 stable', accessor: 'BEAM1_STABLE' },
            // { Header: 'B2 stable', accessor: 'BEAM2_STABLE' },
            // { Header: 'B-Field', accessor: 'b_field' }, // { Header: 'Events', accessor: 'EVENTS' },

            { Header: 'Duration', accessor: 'duration' },

            // { Header: 'TIBTID on', accessor: 'TIBTID_READY' },
            // { Header: 'TEC+ on', accessor: 'TECP_READY' },
            // { Header: 'TEC- on', accessor: 'TECM_READY' },
            // { Header: 'FPIX on', accessor: 'FPIX_READY' },
            // { Header: 'BPIX on', accessor: 'BPIX_READY' },
            // { Header: 'RPC on', accessor: 'RPC_READY' },
            // { Header: 'CSC+ on', accessor: 'CSCP_READY' },
            // { Header: 'CSC- on', accessor: 'CSCM_READY' },
            // { Header: 'CSC in', accessor: 'CSC_PRESENT' },
            // { Header: 'DT+ on', accessor: 'DTP_READY' },
            // { Header: 'DT- on', accessor: 'DTM_READY' },
            // { Header: 'DT0 on', accessor: 'DT0_READY' },
            // { Header: 'DT in', accessor: 'DT_PRESENT' },
            // { Header: 'RPC in', accessor: 'RPC_PRESENT' }
            // The new ones from OMS:
            { Header: 'Clock Type', accessor: 'clock_type' }
            // { Header: 'Cms Sw Version', accessor: 'cmssw_version' },
            // { Header: 'Delivered Lumi', accessor: 'delivered_lumi' },
            // { Header: 'end_lumi', accessor: 'end_lumi' }
        ];

        // Put components in format Header: component
        let component_columns = components.map(component => ({
            Header: component
        }));

        component_columns = component_columns.map(column => {
            return {
                ...column,
                maxWidth: '60px',
                id: `${column['Header']}_PRESENT`,
                accessor: data => {
                    let status = 'EXCLUDED';
                    const triplet = data[`${column['Header']}_triplet`];
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
                                    <span style={{ color: 'white' }}>GOOD</span>
                                </div>
                            )}
                            {value === 'EXCLUDED' && (
                                <div
                                    style={{
                                        backgroundColor: 'grey',
                                        borderRadius: '1px'
                                    }}
                                >
                                    <span style={{ color: 'white' }}>
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
                                    <span style={{ color: 'white' }}>BAD</span>
                                </div>
                            )}
                            {value === 'STANDBY' && (
                                <div
                                    style={{
                                        backgroundColor: 'yellow',
                                        borderRadius: '1px'
                                    }}
                                >
                                    <span style={{ color: 'black' }}>
                                        STANDBY
                                    </span>
                                </div>
                            )}
                        </span>
                    );
                }
            };
        });
        columns = [...columns, ...component_columns, ...other_columns];
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
                )
            };
        });
        return (
            <div>
                <ManageRunModal />
                <ReactTable
                    columns={columns}
                    manual
                    data={
                        runs // Forces table not to paginate or sort automatically, so we can handle it server-side
                    }
                    pages={pages}
                    loading={
                        loading // Display the total number of pages
                    }
                    onFetchData={
                        this.fetchData // Display the loading overlay when we need it
                    }
                    filterable={filterable}
                    defaultPageSize={
                        25 // Request new data when things change
                    }
                    className="-striped -highlight"
                    getTdProps={(state, rowInfo, column, instance) => {
                        return {
                            onClick: (e, handleOriginal) => {
                                if (column.id === 'manage') {
                                    showManageRunModal(rowInfo.original);
                                }
                                // IMPORTANT! React-Table uses onClick internally to trigger
                                // events like expanding SubComponents and pivots.
                                // By default a custom 'onClick' handler will override this functionality.
                                // If you want to fire the original onClick handler, call the
                                // 'handleOriginal' function.
                                if (handleOriginal) {
                                    handleOriginal();
                                }
                            }
                        };
                    }}
                />
                <br />
                {/* <Tips /> */}
                {/* <Logo /> */}
                <style jsx global>{`
                    .ReactTable .rt-th,
                    .ReactTable .rt-td {
                        font-size: 11px;
                        padding: 3px 5px !important;
                    }
                `}</style>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        filterable: state.online.ui.table.filterable,
        run_table: state.online.runs
    };
};

export default connect(
    mapStateToProps,
    { filterRuns, toggleTableFilters, showManageRunModal }
)(App);
