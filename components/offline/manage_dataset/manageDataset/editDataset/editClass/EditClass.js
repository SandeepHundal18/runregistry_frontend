import React, { Component } from 'react';
import { connect } from 'react-redux';
import Swal from 'sweetalert2';
import { Formik, Field } from 'formik';
import { Input, Button } from 'antd';
import { editRun } from '../../../../../../ducks/online/runs';

class EditClass extends Component {
    state = { editing: false };

    render() {
        const { run, editRun } = this.props;
        const initialValues = { class: run.class.value };
        return (
            <div
                style={{ margin: '0 auto', width: '100%', textAlign: 'center' }}
            >
                {this.state.editing ? (
                    <Formik
                        initialValues={initialValues}
                        onSubmit={async value => {
                            await editRun(run.run_number, value);
                            await Swal(
                                `Run ${
                                    run.run_number
                                } class changed successfully to ${value.class}`,
                                '',
                                'success'
                            );
                        }}
                        render={({ values, setFieldValue, handleSubmit }) => (
                            <form onSubmit={handleSubmit}>
                                <Input
                                    style={{
                                        width: '200px',
                                        marginRight: '10px'
                                    }}
                                    value={values['class']}
                                    onChange={evt =>
                                        setFieldValue('class', evt.target.value)
                                    }
                                    name="class"
                                    type="text"
                                    disabled
                                />
                                <Button
                                    style={{ marginRight: '10px' }}
                                    onClick={() =>
                                        this.setState({ editing: false })
                                    }
                                >
                                    Cancel
                                </Button>
                                <Button type="primary" htmlType="submit">
                                    Edit
                                </Button>
                            </form>
                        )}
                    />
                ) : (
                    <div>
                        Class: {run.class.value}{' '}
                        <a onClick={() => this.setState({ editing: true })}>
                            (Edit Class)
                        </a>
                    </div>
                )}
                <br />
            </div>
        );
    }
}

export default connect(
    null,
    { editRun }
)(EditClass);
