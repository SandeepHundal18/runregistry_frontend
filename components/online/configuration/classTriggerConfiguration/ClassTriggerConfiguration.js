import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Input, Icon } from 'antd';
import dynamic from 'next/dynamic';
import ReactTable from 'react-table';
import {
    fetchClassClassifiers,
    newClassClassifier,
    editClassClassifier,
    deleteClassClassifier
} from '../../../../ducks/online/classifiers/class/classifiers';
import {
    editClassClassifierIntent,
    newClassClassifierIntent,
    hideJsonEditor
} from '../../../../ducks/online/classifiers/class/ui';
const TextEditor = dynamic(import('./JSONEditor/Editor'), {
    ssr: false
});
const { TextArea } = Input;

class ClassTriggerConfiguration extends Component {
    state = {
        loading: false,
        json_editor_value: null
    };
    componentDidMount() {
        this.props.fetchClassClassifiers();
    }

    onEditorChange = (value, otherValue) => {
        this.setState({ json_editor_value: value });
    };

    saveClassClassifier = () => {
        const valid_js_object = JSON.parse(this.state.json_editor_value);
        // Check if user was editing or creating a new Trigger:
        // if (this.props.current_editing_classifier !== null) {
        //     this.props.editClassClassifier(valid_js_object);
        // } else {
            this.props.newClassClassifier(valid_js_object);
        // }
    };
    render() {
        const columns = [
            {
                Header: 'id',
                width: 50,
                accessor: 'id',
                getProps: () => ({ style: { textAlign: 'center' } })
            },
            {
                Header: 'Priority',
                accessor: 'priority',
                width: 80,
                getProps: () => ({ style: { textAlign: 'center' } })
            },
            {
                Header: 'Enabled',
                accessor: 'enabled',
                width: 80,
                Cell: row => (
                    <div style={{ textAlign: 'center' }}>
                        <Icon
                            style={{
                                margin: '0 auto',
                                color: row.value ? 'green' : 'red'
                            }}
                            type={row.value ? 'check-circle' : 'close-circle'}
                        />
                    </div>
                )
            },
            { Header: 'JSON string', accessor: 'classifier', width: 250 },
            { Header: 'Created at', accessor: 'createdAt', width: 100 },
            { Header: 'Updated at', accessor: 'updatedAt', width: 100 },
            {
                Header: 'Edit',
                width: 100,
                Cell: row => (
                    <div style={{ textAlign: 'center' }}>
                        <a
                            onClick={() => {
                                this.props.editClassClassifierIntent(
                                    row.original
                                );
                                this.setState({
                                    json_editor_value: row.original.classifier
                                });
                            }}
                        >
                            Edit
                        </a>
                    </div>
                )
            },
            {
                Header: 'Delete',
                width: 100,
                Cell: row => (
                    <div style={{ textAlign: 'center' }}>
                        <a
                            onClick={() =>
                                this.props.deleteClassClassifier(
                                    row.original.id
                                )
                            }
                        >
                            Delete
                        </a>
                    </div>
                )
            }
        ];
        return (
            <div>
                <p>Current criteria:</p>
                <div>
                    <ReactTable
                        columns={columns}
                        data={this.props.classifiers}
                        defaultPageSize={10}
                        showPagination={this.props.classifiers.length > 10}
                        optionClassName="react-table"
                    />
                </div>
                <h3>
                    {this.props.editor && this.state.json_editor_value === ''
                        ? 'Adding new trigger'
                        : this.state.json_editor_value !== null
                            ? 'Editing trigger'
                            : ''}
                </h3>
                <div className="trigger_button">
                    {!this.props.editor && (
                        <Button
                            type="primary"
                            onClick={() => {
                                this.props.newClassClassifierIntent();
                                this.setState({
                                    json_editor_value: ''
                                });
                            }}
                        >
                            Add Trigger
                        </Button>
                    )}
                </div>
                {this.props.editor && (
                    <TextEditor
                        onChange={this.onEditorChange}
                        value={this.state.json_editor_value}
                        lan="javascript"
                        theme="github"
                    />
                )}
                {this.props.editor && (
                    <div className="trigger_button">
                        <span className="cancel_button">
                            <Button
                                onClick={() => {
                                    this.setState({ json_editor_value: null });
                                    this.props.hideJsonEditor();
                                }}
                            >
                                Cancel
                            </Button>
                        </span>
                        <Button
                            loading={this.state.loading}
                            type="primary"
                            onClick={this.saveClassClassifier}
                        >
                            Save
                        </Button>
                    </div>
                )}

                <style jsx>{`
                    .trigger_button {
                        margin-top: 20px;
                        margin-bottom: 20px;
                        display: flex;
                        justify-content: flex-end;
                    }

                    .cancel_button {
                        margin-right: 10px;
                    }
                `}</style>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        classifiers: state.online.classifiers.class.classifiers,
        editor: state.online.classifiers.class.ui.json_editor,
        editor_save_loading:
            state.online.classifiers.class.ui.editor_save_loading
    };
};

export default connect(
    mapStateToProps,
    {
        fetchClassClassifiers,
        newClassClassifier,
        editClassClassifier,
        deleteClassClassifier,
        editClassClassifierIntent,
        newClassClassifierIntent,
        hideJsonEditor
    }
)(ClassTriggerConfiguration);

const long_string = `{
   "ECAL": {
      "good": [
         {
            "type": "and",
            "condition": [
               {
                  "type": ">",
                  "identifier": "events",
                  "value": 100
               },
               {
                  "type": "<",
                  "identifier": "runLiveLumi",
                  "value": 80
               }
            ]
         },
         {
            "type": "or",
            "condition": [
               {
                  "type": "=",
                  "identifier": "beam1Stable",
                  "value": "false"
               }
            ]
         }
      ],
      "bad": []
   }
}`;
