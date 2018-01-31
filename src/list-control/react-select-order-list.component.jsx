/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import {
  Checkbox,
  Col,
  ControlLabel,
  FormGroup,
  Grid,
  Row } from 'react-bootstrap';
import { SearchBar } from '@opuscapita/react-searchbar';
import 'font-awesome/scss/font-awesome.scss';
import AvailableDataList from './available-list/available-list.component';
import SelectedDataList from './selected-list/selected-list.component';
import Utils from './data.utils';
import './react-select-order-list.component.scss';

export default class SelectOrderList extends React.PureComponent {
  static propTypes = {
    availableData: ImmutablePropTypes.listOf(PropTypes.shape({
      label: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
      value: PropTypes.oneOfType([PropTypes.bool, PropTypes.number, PropTypes.string]),
    })).isRequired,
    onChange: PropTypes.func.isRequired,
    dataSelectionId: PropTypes.string.isRequired,
    allSelectionId: PropTypes.string.isRequired,
    id: PropTypes.string,
    selectedData: ImmutablePropTypes.listOf(PropTypes.shape({
      label: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
      value: PropTypes.oneOfType([PropTypes.bool, PropTypes.number, PropTypes.string]),
    })),
    availableListLabel: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
    selectedListLabel: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
    allLabel: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
    searchPlaceholder: PropTypes.string,
    allSelected: PropTypes.bool,
  };

  static defaultProps = {
    selectedData: List(),
    id: '',
    availableListLabel: '',
    selectedListLabel: '',
    searchPlaceholder: 'Search...',
    allSelected: false,
    allLabel: '',
  }

  constructor(props) {
    super(props);
    this.state = {
      keyword: '',
      ...this.initData(),
    };
  }

  componentWillReceiveProps(nextProps) {
    const availableData = !this.props.availableData.equals(nextProps.availableData) ?
      this.initAvailableData(nextProps) :
      this.state.availableData.map(item => ({
        ...item,
        isSelected: (item.isLocked === false && nextProps.allSelected) ||
              nextProps.selectedData.filter(data =>
                (data.label === item.label)).size !== 0,
      }));
    const selectedData = nextProps.selectedData.map((item, index) => ({
      ...item,
      key: index,
      priority: index,
      isSelected: true,
    }));

    this.setState({
      visibleAvailableData: Utils.filterData(availableData, this.state.keyword),
      availableData,
      selectedData,
    });
  }

  onAllSelectionChange = () => {
    let selectedData;
    if (this.props.allSelected) {
      selectedData = this.state.selectedData.filter(data => data.isLocked === true);
    } else if (this.props.selectedData.size === 0) {
      selectedData = this.state.selectedData.concat(this.sortDataAlphabetically(this.props.availableData.filter(data => data.isLocked === false)));// eslint-disable-line max-len
    } else {
      const unselectedData = this.props.availableData.filter(item => item.isLocked === false &&
        (this.props.selectedData.findIndex(data => (data.label === item.label)) === -1));
      selectedData = this.props.selectedData.concat(unselectedData);
    }
    this.props.onChange({
      [this.props.allSelectionId]: !this.props.allSelected,
      [this.props.dataSelectionId]: selectedData,
    });
  }

  initData = () => {
    const availableData = this.initAvailableData();
    let selectedData;
    if (this.props.allSelected) {
      selectedData = availableData.filter(item => item.isSelected);
    } else {
      selectedData = this.props.selectedData.map((item, index) => ({
        ...item,
        key: index,
        priority: index,
        isSelected: true,
        isLocked: item.isLocked === undefined ? false : item.isLocked,
      }));
    }

    return {
      visibleAvailableData: availableData,
      availableData,
      selectedData,
    };
  }

  initAvailableData = (props = this.props) => {
    const sortedData = this.sortDataAlphabetically(props.availableData);

    return sortedData.map((item, index) => ({
      ...item,
      key: index,
      priority: index,
      isSelected: (item.isLocked === true && props.allSelected) || props.selectedData.filter(data =>
        (data.label === item.label)).size !== 0,
      isLocked: item.isLocked === undefined ? false : item.isLocked,
    }));
  }

  sortDataAlphabetically = data => (
    data.sort((a, b) => (
      a.label.toLowerCase().localeCompare(b.label.toLowerCase())
    ))
  )

  handleKeywordChange = (e) => {
    const keyword = e;
    const visibleAvailableData =
      Utils.filterData(
        this.state.availableData,
        keyword,
      );
    this.setState({ keyword, visibleAvailableData });
  }

  handleSortChange = ({ oldIndex, newIndex }) => {
    if (newIndex === null || newIndex === oldIndex) {
      return;
    }

    const selectedData =
      Utils.changeDataSort(
        this.state.selectedData,
        oldIndex,
        newIndex,
      );

    this.props.onChange({
      [this.props.allSelectionId]: selectedData.length === this.props.availableData.size,
      [this.props.dataSelectionId]: selectedData,
    });
  }

  handleSelectItem = (selectedItem) => {
    const item = {
      label: selectedItem.label,
      value: selectedItem.value,
      isLocked: false,
    };
    const selectedData = this.state.selectedData.push(item);
    this.props.onChange({
      [this.props.allSelectionId]: selectedData.length === this.props.availableData.size,
      [this.props.dataSelectionId]: selectedData,
    });
  }

  handleDeselectItem = (selectedItem) => {
    const selectedData =
      this.props.selectedData.filter(data => (data.label !== selectedItem.label));
    this.props.onChange({
      [this.props.allSelectionId]: false,
      [this.props.dataSelectionId]: selectedData,
    });
  }

  render() {
    const id = this.props.id ? `oc-select-order-list-${this.props.id}` : 'oc-select-order-list';
    return (
      <Grid id={id} fluid>
        <Row>
          <Col xs={6}>
            <FormGroup>
              <SearchBar
                searchPlaceHolder={this.props.searchPlaceholder}
                value={this.state.keyword}
                onSearch={this.handleKeywordChange}
                inputClassName="oc-data-keyword-input"
                dynamicSearchStartsFrom={1}
              />
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col xs={6}>
            <FormGroup>
              <Row>
                <Col xs={6}>
                  <ControlLabel>{this.props.availableListLabel}</ControlLabel>
                </Col>
                <Col xs={6}>
                  <Checkbox
                    onChange={this.onAllSelectionChange}
                    checked={this.props.allSelected}
                    className="oc-select-order-list-all"
                  >
                    {this.props.allLabel}
                  </Checkbox>
                </Col>
              </Row>
              <AvailableDataList
                id="oc-available-data"
                items={this.state.visibleAvailableData}
                onSelectItem={this.handleSelectItem}
                onDeselectItem={this.handleDeselectItem}
              />
            </FormGroup>
          </Col>
          <Col xs={6}>
            <FormGroup>
              <ControlLabel>{this.props.selectedListLabel}</ControlLabel>
              <SelectedDataList
                id="oc-selected-data"
                items={this.state.selectedData}
                onSortChange={this.handleSortChange}
                onRemoveItem={this.handleDeselectItem}
              />
            </FormGroup>
          </Col>
        </Row>
      </Grid>
    );
  }
}
