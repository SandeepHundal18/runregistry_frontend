import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Icon } from 'antd';
import Swal from 'sweetalert2';
import { offline_columns } from '../../../config/config';
import { filterDatasets } from '../../../ducks/offline/datasets';
import {
    toggleTableFilters,
    showManageRunModal,
    showLumisectionModal
} from '../../../ducks/offline/ui';
// import ManageRunModal from '../manage_run/ManageRunModal';
// import LumisectionModal from '../lumisections/LumisectionModal';
// import runs from '../../../ducks/runs.json';

// Import React Table
import ReactTable from 'react-table';

class DatasetTable extends Component {
    fetchData = (table, instance) => {
        // Whenever the table model changes, or the user sorts or changes pages, this method gets called and passed the current table model.
        // You can set the `loading` prop of the table to true to use the built-in one or show you're own loading bar if you want.
        this.setState({ loading: true });
        this.props.filterDatasets(
            table.pageSize,
            table.page,
            table.sorted,
            table.filtered
        );
    };
    render() {
        // const { data, pages, loading } = this.state;
        const {
            workspace,
            filterable,
            dataset_table,
            showManageRunModal,
            showLumisectionModal
        } = this.props;
        const { datasets, pages, loading } = dataset_table;
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
                },
                maxWidth: 100
            },
            {
                Header: 'Class',
                Cell: ({ original }) => original.run.class,
                maxWidth: 100
            },
            {
                Header: 'Manage / LS',
                id: 'manage',
                maxWidth: 75,
                filterable: false,
                Cell: ({ original }) => (
                    <div style={{ textAlign: 'center' }}>
                        <a onClick={() => showManageRunModal(original)}>
                            Manage
                        </a>
                        {' / '}
                        <a onClick={evt => showLumisectionModal(original)}>
                            LS
                        </a>
                    </div>
                ),
                maxWidth: 100
            },
            {
                Header: 'Significant',
                id: 'significant',
                maxWidth: 62,
                Cell: ({ original }) => (
                    <div style={{ textAlign: 'center' }}>
                        {original.significant ? (
                            <Icon type={'check'} />
                        ) : (
                            <a
                                onClick={async () => {
                                    const { value } = await Swal({
                                        type: 'warning',
                                        title:
                                            'Are you sure you want to make the run Significant',
                                        text: '',
                                        showCancelButton: true,
                                        confirmButtonText: 'Yes',
                                        reverseButtons: true,
                                        footer: '<a >What does this mean?</a>'
                                    });
                                    if (value) {
                                        console.log('f');
                                        await Swal(
                                            `Run ${
                                                original.run_number
                                            } marked significant`,
                                            '',
                                            'success'
                                        );
                                    }
                                }}
                            >
                                <Icon type={'close-square'} />
                            </a>
                        )}
                    </div>
                )
            },
            {
                Header: 'State',
                id: 'state',
                accessor: 'state',
                Cell: ({ value }) => (
                    <div style={{ textAlign: 'center' }}>
                        <span
                            style={{
                                color: 'white',
                                fontSize: '0.95em',
                                backgroundColor: 'grey',
                                borderRadius: '1px'
                            }}
                        >
                            <span style={{ padding: '4px' }}>SIGNOFF</span>
                        </span>
                        {' / '}
                        <a
                            onClick={async () => {
                                const { value: state } = await Swal({
                                    title: 'Move to...',
                                    input: 'select',
                                    inputOptions: {
                                        OPEN: 'To OPEN',
                                        SIGNOFF: 'to SIGNOFF',
                                        COMPLETED: 'to COMPLETED'
                                    },
                                    showCancelButton: true,
                                    reverseButtons: true
                                });
                                console.log(state);
                            }}
                        >
                            move
                        </a>
                    </div>
                ),
                maxWidth: 100
            }
            // { Header: 'Started', accessor: 'start_time' },
            // { Header: 'Hlt Key Description', accessor: 'hlt_key' }
        ]; // { Header: 'Stopped', accessor: 'STOPTIME' },];

        const other_columns = [
            // { Header: 'LHC Fill', accessor: 'LHCFILL' }, // { Header: 'B1 stable', accessor: 'BEAM1_STABLE' },
            // { Header: 'B2 stable', accessor: 'BEAM2_STABLE' },
            // { Header: 'B-Field', accessor: 'b_field' }, // { Header: 'Events', accessor: 'EVENTS' },
            // { Header: 'Duration', accessor: 'duration' },
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
            // { Header: 'Clock Type', accessor: 'clock_type' }
            // { Header: 'Cms Sw Version', accessor: 'cmssw_version' },
            // { Header: 'Delivered Lumi', accessor: 'delivered_lumi' },
            // { Header: 'end_lumi', accessor: 'end_lumi' }
        ];

        // Put components in format Header: component
        let offline_columns_composed = offline_columns
            .filter(column => {
                if (workspace === 'global') {
                    return !column.includes('_');
                }
                return column.startsWith(workspace.toLowerCase());
            })
            .map(column => ({
                Header: column.split('_').join(' ')
            }));

        offline_columns_composed = offline_columns_composed.map(column => {
            return {
                ...column,
                maxWidth: 100,
                id: `${column['Header']}_triplet`,
                accessor: data => {
                    let status = 'EXCLUDED';
                    const triplet = data[`${column['Header']}`];
                    const { significant } = data;
                    if (triplet && significant) {
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

        columns = [...columns, ...offline_columns_composed, ...other_columns];

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
                {/* <ManageRunModal />
                <LumisectionModal /> */}
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
                    onFetchData={
                        this.fetchData // Display the loading overlay when we need it
                    }
                    filterable={filterable}
                    defaultPageSize={
                        25 // Request new data when things change
                    }
                    className="-striped -highlight"
                    // getTdProps={(state, rowInfo, column, instance) => {
                    //     return {
                    //         onClick: (e, handleOriginal) => {
                    //             if (column.id === 'significant') {
                    //                 console.log('f');
                    //             }
                    //             // IMPORTANT! React-Table uses onClick internally to trigger
                    //             // events like expanding SubComponents and pivots.
                    //             // By default a custom 'onClick' handler will override this functionality.
                    //             // If you want to fire the original onClick handler, call the
                    //             // 'handleOriginal' function.
                    //             if (handleOriginal) {
                    //                 handleOriginal();
                    //             }
                    //         }
                    //     };
                    // }}
                />
                <br />
                {/* <Tips /> */}
                {/* <Logo /> */}
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

export default connect(
    mapStateToProps,
    {
        filterDatasets,
        toggleTableFilters,
        showManageRunModal,
        showLumisectionModal
    }
)(DatasetTable);
