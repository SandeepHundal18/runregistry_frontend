import React, { Component } from 'react';
import dynamic from 'next/dynamic';
import { connect } from 'react-redux';
import { AutoComplete, Menu, Button, Input } from 'antd';
import {
  CloseCircleOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import Swal from 'sweetalert2';
import {
  generateJson,
  changeJsonLogic,
  getJsonConfigurations,
  resetJson,
  addConfiguration,
  editConfiguration,
  deleteJsonConfiguration
} from '../../../../ducks/json/configuration';
import stringify from 'json-stringify-pretty-compact';
import swal from 'sweetalert2';

const { SubMenu } = Menu;

const TextEditor = dynamic(
  import('../../../common/ClassifierEditor/JSONEditor/JSONEditor'),
  {
    ssr: false
  }
);

class Configuration extends Component {
  state = {
    menu_selection: 'golden',
    editing: false,
    creating: false,
    new_name: '',
    run_list: false
  };

  async componentDidMount() {
    await this.props.getJsonConfigurations();
    const default_selection = this.state.menu_selection;
    this.handleMenuChange(default_selection);
  }
  handleMenuChange = new_menu_selection => {
    if (!new_menu_selection) {
      new_menu_selection = 'golden';
    }
    this.props.resetJson();
    this.setState({ menu_selection: new_menu_selection });
    const json_logic = this.props.json_configurations[new_menu_selection];
    const formatted = stringify(json_logic);
    this.changeValue(formatted);
  };

  createNewConfiguration = async new_configuration => {
    new_configuration = JSON.parse(new_configuration);
    const { new_name } = this.state;
    await this.props.addConfiguration(new_configuration, new_name);
    await this.props.getJsonConfigurations();
    this.setState({ creating: false });
    this.handleMenuChange(new_name);
    await Swal(`New Configuration ${new_name} added`, '', 'success');
  };

  editConfiguration = async new_configuration => {
    new_configuration = JSON.parse(new_configuration);
    const { menu_selection } = this.state;
    const { json_configurations_array } = this.props;
    const selected = json_configurations_array.find(
      ({ name }) => name === menu_selection
    );
    selected.classifier = new_configuration;
    await this.props.editConfiguration(selected, menu_selection);
    await this.props.getJsonConfigurations();
    this.setState({ editing: false });
    this.handleMenuChange(menu_selection);
    await Swal(`Configuration ${menu_selection} edited`, '', 'success');
  };

  deleteConfiguration = async () => {
    const { menu_selection } = this.state;
    if (menu_selection === 'golden') {
      return await Swal('Cannot delete golden configuration', '', 'warning');
    }
    const { json_configurations_array } = this.props;
    const selected = json_configurations_array.find(
      ({ name }) => name === menu_selection
    );
    const { value } = await Swal({
      type: 'warning',
      title: `Are you sure you want to delete ${menu_selection} JSON configuration`,
      text: '',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      reverseButtons: true
    });
    if (value) {
      await this.props.deleteJsonConfiguration(selected.id);
      await Swal(`Configuration deleted`, '', 'success');
      await this.props.getJsonConfigurations();
      this.handleMenuChange(); // It will select golden by default
    }
  };

  changeValue = new_configuration => {
    this.props.changeJsonLogic(new_configuration);
  };

  getDisplayedJSON(json) {
    return stringify(json);
  }

  toggleCreationMode = () => {
    this.props.resetJson();
    this.setState({ creating: !this.state.creating });
  };

  toggleEditionMode = () => {
    this.props.resetJson();
    this.setState({ editing: !this.state.editing });
  };

  addNewConfigurationInput = () => (
    <div className="creating_menu">
      <Input
        onChange={({ target }) =>
          this.setState({
            new_name: target.value
          })
        }
        placeholder="Enter the name of the new configuration"
      />
      <Button onClick={this.toggleCreationMode}>
        <CloseCircleOutlined />
      </Button>
      <style jsx>{`
        .creating_menu > :global(.ant-input) {
          width: 80%;
        }
      `}</style>
    </div>
  );

  getRunList = current_json => {
    const runs = [];
    for (const [key, val] of Object.entries(current_json)) {
      runs.push(+key);
    }
    return runs;
  };

  render() {
    const {
      json_configurations,
      json_configurations_array,
      generateJson,
      current_json,
      json_logic,
      number_of_runs,
      number_of_lumisections
    } = this.props;
    const { creating, menu_selection, editing } = this.state;
    const download_string =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(this.getDisplayedJSON(current_json));

    const options = [
      {
        label: 'Unique dataset name',
        options: [
          {
            value: '/PromptReco/Collisions2018A/DQM',
            label: '/PromptReco/Collisions2018A/DQM'
          }
        ]
      },
      {
        label: 'Partial dataset name (including all eras)',
        options: [
          {
            value: '/PromptReco/Collisions2018_/DQM',
            label: '/PromptReco/Collisions2018_/DQM'
          }
        ]
      },
      {
        label: 'Partial dataset name (incomplete start or end)',
        options: [
          {
            value: '%/PromptReco/Collisions%',
            label: '/PromptReco/Collisions2018_/DQM'
          }
        ]
      }
    ];
    return (
      <div className="configuration">
        <div className="editor">
          <div style={{ width: '80%' }}>
            Enter range of the json you want:
            <br />
            <AutoComplete
              dropdownClassName="certain-category-search-dropdown"
              dropdownMatchSelectWidth={500}
              style={{ width: 250 }}
              options={options}
            >
              <Input.Search
                placeholder="Enter a dataset name (e.g. /PromptReco/HICosmics18_/DQM)"
                onChange={e => this.setState({ dataset_name: e.target.value })}
              />
            </AutoComplete>
            <br />
          </div>
          <br />
          <br />
          {creating ? (
            this.addNewConfigurationInput()
          ) : (
            <Menu
              onClick={({ key }) => this.handleMenuChange(key)}
              selectedKeys={[menu_selection]}
              mode="horizontal"
            >
              {json_configurations_array.map(({ name }) => (
                <Menu.Item key={name}>{name}</Menu.Item>
              ))}
              <Menu.Item key="arbitrary">arbitrary configuration</Menu.Item>
              <Button type="link" onClick={this.toggleCreationMode}>
                <PlusCircleOutlined />
              </Button>
            </Menu>
          )}
          {menu_selection !== 'arbitrary' && !creating && !editing && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '10px'
              }}
            >
              <Button type="link" onClick={this.toggleEditionMode}>
                <EditOutlined />
              </Button>
              &nbsp;
              <Button type="link" onClick={this.deleteConfiguration}>
                <DeleteOutlined />
              </Button>
            </div>
          )}
          {editing && (
            <div>
              <span>
                You are now editing the <strong>{menu_selection}</strong> JSON
                configuration, edit below and then click 'Edit configuration'
                (below)
              </span>{' '}
              &nbsp;
              <Button onClick={this.toggleEditionMode}>
                <CloseCircleOutlined />
              </Button>
            </div>
          )}
          {menu_selection === 'arbitrary' && (
            <h3>Insert JSON-logic to generate arbitrary json:</h3>
          )}
          {creating && (
            <p>
              Enter name of new configuration and enter JSON logic below, then
              click save (below)
            </p>
          )}
          <br />
          <TextEditor
            onChange={this.changeValue}
            value={json_logic}
            lan="javascript"
            theme="github"
          />
          <div className="generate_button">
            {creating ? (
              <Button
                type="primary"
                onClick={() => this.createNewConfiguration(json_logic)}
              >
                Save new configuration
              </Button>
            ) : editing ? (
              <Button
                type="dashed"
                onClick={() => this.editConfiguration(json_logic)}
              >
                Edit configuration
              </Button>
            ) : (
              <div>
                <Button type="primary" onClick={() => generateJson(json_logic)}>
                  Generate JSON
                </Button>
              </div>
            )}
          </div>
          <br />
          <br />
        </div>

        <div className="produced_json">
          <h3>Generated JSON:</h3>
          <TextEditor
            onChange={() => {}}
            value={
              this.state.run_list
                ? this.getDisplayedJSON(this.getRunList(current_json))
                : this.getDisplayedJSON(current_json)
            }
            lan="javascript"
            theme="github"
            readOnly={true}
          />
          The number of runs in this json are: {number_of_runs} and number of
          lumisections: {number_of_lumisections}
          <br />
          <Button
            onClick={() => {
              this.setState({ run_list: !this.state.run_list });
            }}
          >
            {this.state.run_list ? 'Get lumisections' : 'Get run list'}
          </Button>
          <div className="generate_button">
            <Button
              type="primary"
              disabled={current_json === '{}'}
              onClick={() => generateJson(json_logic)}
            >
              <a href={download_string} download="custom_json.json">
                Download JSON file
              </a>
            </Button>
          </div>
        </div>

        <style jsx>{`
          .configuration {
            display: flex;
          }
          .editor {
            width: 1000px;
          }
          .produced_json {
            width: 1000px;
          }
          .generate_button {
            margin-top: 10px;
            display: flex;
            justify-content: center;
          }
        `}</style>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    json_configurations: state.json.configuration.json_configurations,
    json_configurations_array:
      state.json.configuration.json_configurations_array,
    current_json: state.json.configuration.current_json,
    json_logic: state.json.configuration.json_logic,
    number_of_runs: state.json.configuration.number_of_runs,
    number_of_lumisections: state.json.configuration.number_of_lumisections
  };
}

export default connect(mapStateToProps, {
  generateJson,
  changeJsonLogic,
  getJsonConfigurations,
  resetJson,
  addConfiguration,
  editConfiguration,
  deleteJsonConfiguration
})(Configuration);
