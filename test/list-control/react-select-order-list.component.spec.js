/* eslint-disable no-unused-expressions, prefer-arrow-callback, react/jsx-filename-extension */
import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import sinon from 'sinon';
import { List } from 'immutable';

import { SelectOrderList } from '../../src/list-control/index';
import { debug, log } from 'util';

describe('ListItems component', function describe() {
  it('should render and function correctly', function it() {
    const props = {
      dataChange: () => {},
      avaibleListLabel: '',
      selectedListLabel: '',
      availableData: List([
        {
          key: 1,
          label: 'one',
          isSelected: false,
          priority: -1,
        },
        {
          key: 2,
          label: 'two',
          isSelected: true,
          priority: 1,
        },
        {
          key: 3,
          label: 'three',
          isSelected: true,
          priority: 0,
        },
      ]),
      selectedData: List([
        {
          key: 2,
          label: 'two',
          isSelected: true,
          priority: 1,
        },
        {
          key: 3,
          label: 'three',
          isSelected: true,
          priority: 0,
        },
      ]),
    };
    const wrapper = mount(<SelectOrderList {...props} />);
    expect(wrapper.find('.oc-data-keyword-input').exists()).to.equal(true);
    let spy;
    spy = sinon.spy(wrapper.instance(), 'handleKeywordChange');
    wrapper.instance().handleKeywordChange({ target: { value: 'test' } });
    expect(spy.called).to.be.true;
    spy = sinon.spy(wrapper.instance(), 'handleSortChange');
    wrapper.instance().handleSortChange(1, 2);
    expect(spy.called).to.be.true;
    spy = sinon.spy(wrapper.instance(), 'handleSelectItem');
    wrapper.instance().handleSelectItem({ key: 1 });
    expect(spy.called).to.be.true;
    spy = sinon.spy(wrapper.instance(), 'handleDeselectItem');
    wrapper.instance().handleDeselectItem({ key: 1, priority: 1 });
    expect(spy.called).to.be.true;
    wrapper.unmount();
  });
});