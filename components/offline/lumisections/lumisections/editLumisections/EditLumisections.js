import React, { Component } from 'react';
import { connect } from 'react-redux';
import Swal from 'sweetalert2';
import { Formik, Field } from 'formik';
import { Divider, InputNumber, Select, Button } from 'antd';
import { editLumisections } from '../../../../../ducks/offline/lumisections';

const Option = Select.Option;

class EditLumisections extends Component {
    render() {
        const { dataset } = this.props;
        return (
            <div className="edit_lumisections">
                <Divider>Edit</Divider>
                <Formik
                    onSubmit={async values => {
                        values.id_dataset = dataset.id;
                        await this.props.editLumisections(values);
                        await Swal(
                            `Dataset LS edited successfully`,
                            '',
                            'success'
                        );
                    }}
                    render={({ values, setFieldValue, handleSubmit }) => (
                        <form onSubmit={handleSubmit}>
                            <label className="label">
                                Lumisection start (including):
                            </label>
                            <InputNumber
                                name="from"
                                value={values.from}
                                onChange={value => setFieldValue('from', value)}
                            />
                            <label className="label">
                                Lumisection to (including):
                            </label>
                            <InputNumber
                                name="to"
                                value={values.to}
                                onChange={value => setFieldValue('to', value)}
                            />
                            <label htmlFor="" className="label">
                                Bit:
                            </label>
                            <Select
                                name="bit"
                                value={values.bit}
                                onChange={value => setFieldValue('bit', value)}
                                style={{ width: 220, marginRight: '10px' }}
                            >
                                <Option value="beam1_present">
                                    beam1_present
                                </Option>
                                <Option value="beam2_present">
                                    beam2_present
                                </Option>
                            </Select>
                            <label htmlFor="" className="label">
                                Action:
                            </label>
                            <Select
                                name="action"
                                value={values.action}
                                onChange={value =>
                                    setFieldValue('action', value)
                                }
                                style={{ width: 220, marginRight: '10px' }}
                            >
                                <Option value="true">Set to TRUE</Option>
                                <Option value="false">Set to FALSE</Option>
                            </Select>
                            <Button htmlType="submit">Apply</Button>
                        </form>
                    )}
                />
                <Divider>Lumisections</Divider>
                <style jsx>{`
                    .edit_lumisections {
                        margin-bottom: 10px;
                    }
                    .label {
                        margin-right: 10px;
                        margin-left: 10px;
                    }
                `}</style>
            </div>
        );
    }
}

export default connect(
    null,
    { editLumisections }
)(EditLumisections);
