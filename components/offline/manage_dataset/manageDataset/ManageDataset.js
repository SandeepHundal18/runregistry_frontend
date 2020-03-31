import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Collapse } from 'antd';
import EditDataset from './editDataset/EditDataset';

const Panel = Collapse.Panel;

class ManageDataset extends Component {
  render() {
    const { dataset } = this.props;
    return (
      <Collapse defaultActiveKey={['3']}>
        {/* <Panel key="1" header="Run info">
                    <p>Run info</p>
                </Panel> */}
        <Panel key="2" header="Dataset History">
          <div>
            This feature is still in development, history is being saved but the
            interface to show it is currently being built
          </div>
        </Panel>
        <Panel key="3" header="Edit dataset">
          <EditDataset dataset={dataset} />
        </Panel>
      </Collapse>
    );
  }
}

const mapStateToProps = state => {
  return {
    dataset: state.offline.ui.manage_dataset_modal_dataset
  };
};

export default connect(mapStateToProps)(ManageDataset);
