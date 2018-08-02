import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal, Button } from 'antd';
import { hideConfigurationModal } from '../../../ducks/online/ui';
import ClassClassifierConfiguration from './classClassifierConfiguration/ClassClassifierConfiguration';
import PreSelectionTriggerConfiguration from './preSelectionTriggerConfiguration/PreSelectionTriggerConfiguration';

class ConfigurationModal extends Component {
    render() {
        const {
            configuration_modal_visible,
            hideConfigurationModal,
            children,
            configuration_modal_type
        } = this.props;
        const title =
            configuration_modal_type === 'class_configuration'
                ? 'Set Automatic classifiers for class of run selection'
                : configuration_modal_type === 'pre_selection_configuration'
                    ? 'Set automatic classifiers for pre selection of runs'
                    : '';
        return (
            <div>
                <Modal
                    title={title}
                    visible={configuration_modal_visible}
                    onOk={hideConfigurationModal}
                    onCancel={
                        hideConfigurationModal // confirmLoading={confirmLoading}
                    }
                    footer={[
                        <Button key="submit" onClick={hideConfigurationModal}>
                            Close
                        </Button>
                    ]}
                    width="90vw"
                    maskClosable={false}
                    destroyOnClose={true}
                >
                    <ClassClassifierConfiguration />

                    {/* // {configuration_modal_type === 'class_configuration' && (
                    //     <ClassClassifierConfiguration />
                    // )}
                    // {configuration_modal_type ===
                    //     'pre_selection_configuration' && (
                    //     <PreSelectionTriggerConfiguration />
                    // )} */}
                </Modal>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        configuration_modal_visible:
            state.online.ui.configuration_modal_visible,
        configuration_modal_type: state.online.ui.configuration_modal_type
    };
};
export default connect(
    mapStateToProps,
    { hideConfigurationModal }
)(ConfigurationModal);
