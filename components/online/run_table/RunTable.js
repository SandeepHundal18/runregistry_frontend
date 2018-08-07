import React, { Component } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { render } from 'react-dom';
import { Icon } from 'antd';
import _ from 'lodash';
import { toggleTableFilters } from '../../../ducks/online/ui';
// import runs from '../../../ducks/runs.json';

// Import React Table
import ReactTable from 'react-table';

let rawData = [];

const requestData = (pageSize, page, sorted, filtered, runs) => {
    return new Promise((resolve, reject) => {
        // You can retrieve your data however you want, in this case, we will just use some local data.
        let filteredData = rawData;

        // You can use the filters in your request, but you are responsible for applying them.
        if (filtered.length) {
            filteredData = filtered.reduce((filteredSoFar, nextFilter) => {
                return filteredSoFar.filter(row => {
                    return (row[nextFilter.id] + '').includes(nextFilter.value);
                });
            }, filteredData);
        }
        // You can also use the sorting in your request, but again, you are responsible for applying it.
        const sortedData = _.orderBy(
            filteredData,
            sorted.map(sort => {
                return row => {
                    if (row[sort.id] === null || row[sort.id] === undefined) {
                        return -Infinity;
                    }
                    return typeof row[sort.id] === 'string'
                        ? row[sort.id].toLowerCase()
                        : row[sort.id];
                };
            }),
            sorted.map(d => (d.desc ? 'desc' : 'asc'))
        );

        if (rawData.length === 0) {
            // axios.get(`${api_url}/online/runs`).then(res => {
            // rawData = res.data;
            rawData = runs;
            resolve({
                rows: rawData.slice(
                    pageSize * page,
                    pageSize * page + pageSize
                ),
                pages: Math.ceil(rawData.length / pageSize)
                // });
            });
        } else {
            // You must return an object containing the rows of the current page, and optionally the total pages number.
            const res = {
                rows: sortedData.slice(
                    pageSize * page,
                    pageSize * page + pageSize
                ),
                pages: Math.ceil(filteredData.length / pageSize)
            };

            // Here we'll simulate a server response with 500ms of delay.
            setTimeout(() => resolve(res), 0);
        }
    });
};

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // data: props.runs.slice(20 * 1, 20 * 1 + 20),
            data: [],
            // pages: Math.ceil(props.runs.length / 20),
            pages: null,
            loading: true,
            pageSize: 20
        };
        this.fetchData = this.fetchData.bind(this);
    }

    fetchData(state, instance) {
        // Whenever the table model changes, or the user sorts or changes pages, this method gets called and passed the current table model.
        // You can set the `loading` prop of the table to true to use the built-in one or show you're own loading bar if you want.
        this.setState({ loading: true });
        // Request the data however you want.  Here, we'll use our mocked service we created earlier
        requestData(
            state.pageSize,
            state.page,
            state.sorted,
            state.filtered,
            this.props.runs
        )
            .then(res => {
                // Now just get the rows of data to your React Table (and update anything else like total pages or loading)
                this.setState({
                    data: res.rows,
                    pages: res.pages,
                    loading: false
                });
            })
            .catch(err => {
                console.log('error aca');
            });
    }
    render() {
        // const { data, pages, loading } = this.state;
        const { filterable, run_table } = this.props;
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

        let component_columns = [
            {
                Header: 'CMS'
            },
            {
                Header: 'CASTOR'
            },
            {
                Header: 'CSC'
            },
            {
                Header: 'DT'
            },
            {
                Header: 'ECAL'
            },
            {
                Header: 'ES'
            },
            {
                Header: 'HCAL'
            },
            // {
            //     Header: 'HLT'
            // },
            // {
            //     Header: 'L1T'
            // },
            // {
            //     Header: 'L1TMU'
            // },
            // {
            //     Header: 'L1TCALO'
            // },
            // {
            //     Header: 'LUMI'
            // },
            {
                Header: 'PIX'
            },
            {
                Header: 'RPC'
            },
            // {
            //     Header: 'STRIP'
            // },
            {
                Header: 'CTPPS'
            }
        ];

        component_columns = component_columns.map(column => {
            return {
                ...column,
                maxWidth: '60px',
                id: `${column['Header']}_PRESENT`,
                accessor: data => {
                    let status = 'EXCLUDED';
                    const dataset = data.datasets[0];
                    if (dataset) {
                        status = dataset[column['Header'].toLowerCase()].status;
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
                        {column.Header}&nbsp;&nbsp;
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
                        20 // Request new data when things change
                    }
                    className="-striped -highlight"
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
    { toggleTableFilters }
)(App);
