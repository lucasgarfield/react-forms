import React from 'react';
import { FormRenderer, componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { componentMapper, FormTemplate } from '../index';
import { reducer } from '../field-array';

describe('<FieldArray/>', () => {
  let initialProps;
  let onSubmit;

  beforeEach(() => {
    onSubmit = jest.fn();
    initialProps = {
      componentMapper,
      FormTemplate,
      onSubmit: (values) => onSubmit(values),
    };
  });

  it('renders with label and description + custom labels', async () => {
    initialProps = {
      ...initialProps,
      schema: {
        fields: [
          {
            component: componentTypes.FIELD_ARRAY,
            name: 'nicePeople',
            label: 'I am label',
            description: 'I am description',
            noItemsMessage: 'I have no items',
            buttonLabels: {
              add: 'CUSTOM ADD',
              remove: 'CUSTOM REMOVE',
            },
            fields: [
              {
                component: componentTypes.TEXT_FIELD,
                name: 'name',
              },
            ],
          },
        ],
      },
    };

    render(<FormRenderer {...initialProps} />);

    expect(screen.getByText('I am label')).toBeInTheDocument();
    expect(screen.getByText('I am description')).toBeInTheDocument();
    expect(screen.getByText('I have no items')).toBeInTheDocument();
    expect(screen.getByText('CUSTOM ADD')).toBeInTheDocument();

    userEvent.click(screen.getByText('CUSTOM ADD'));

    expect(screen.getByText('CUSTOM REMOVE')).toBeInTheDocument();
  });

  it('allow to add/remove named fields', async () => {
    initialProps = {
      ...initialProps,
      schema: {
        fields: [
          {
            component: componentTypes.FIELD_ARRAY,
            name: 'nicePeople',
            defaultItem: { name: 'enter a name', lastName: 'enter a last name' },
            fields: [
              {
                component: componentTypes.TEXT_FIELD,
                name: 'name',
              },
              {
                component: componentTypes.TEXT_FIELD,
                name: 'lastName',
              },
            ],
          },
        ],
      },
    };

    render(<FormRenderer {...initialProps} />);

    userEvent.click(screen.getByText('Submit'));

    expect(onSubmit).toHaveBeenCalledWith({});
    onSubmit.mockClear();

    userEvent.click(screen.getByText('ADD'));
    userEvent.click(screen.getByText('Submit'));

    expect(onSubmit).toHaveBeenCalledWith({
      nicePeople: [{ name: 'enter a name', lastName: 'enter a last name' }],
    });
    onSubmit.mockClear();

    userEvent.click(screen.getByText('REMOVE'));
    userEvent.click(screen.getByText('Submit'));

    expect(onSubmit).toHaveBeenCalledWith({
      nicePeople: [],
    });
  });

  it('allow to add/remove unnamed (array) fields', async () => {
    initialProps = {
      ...initialProps,
      schema: {
        fields: [
          {
            component: componentTypes.FIELD_ARRAY,
            name: 'nicePeople',
            defaultItem: 'defaultItem',
            fields: [
              {
                component: componentTypes.TEXT_FIELD,
              },
            ],
          },
        ],
      },
    };

    render(<FormRenderer {...initialProps} />);

    userEvent.click(screen.getByText('Submit'));

    expect(onSubmit).toHaveBeenCalledWith({});
    onSubmit.mockClear();

    userEvent.click(screen.getByText('ADD'));
    userEvent.click(screen.getByText('Submit'));
    expect(onSubmit).toHaveBeenCalledWith({
      nicePeople: ['defaultItem'],
    });

    onSubmit.mockClear();

    userEvent.click(screen.getByText('REMOVE'));
    userEvent.click(screen.getByText('Submit'));

    expect(onSubmit).toHaveBeenCalledWith({
      nicePeople: [],
    });
  });

  it('allow to add/remove within minItems/maxItems range', async () => {
    initialProps = {
      ...initialProps,
      schema: {
        fields: [
          {
            component: componentTypes.FIELD_ARRAY,
            name: 'nicePeople',
            defaultItem: 'defaultItem',
            minItems: 1,
            maxItems: 2,
            fields: [
              {
                component: componentTypes.TEXT_FIELD,
              },
            ],
          },
        ],
      },
    };

    render(<FormRenderer {...initialProps} />);

    userEvent.click(screen.getByText('ADD'));
    userEvent.click(screen.getByText('Submit'));

    expect(onSubmit).toHaveBeenCalledWith({
      nicePeople: ['defaultItem'],
    });
    onSubmit.mockClear();

    userEvent.click(screen.getByText('ADD'));
    userEvent.click(screen.getByText('Submit'));

    expect(onSubmit).toHaveBeenCalledWith({
      nicePeople: ['defaultItem', 'defaultItem'],
    });
    onSubmit.mockClear();

    expect(() => userEvent.click(screen.getByText('ADD'))).toThrow();
    userEvent.click(screen.getByText('Submit'));

    expect(onSubmit).toHaveBeenCalledWith({
      nicePeople: ['defaultItem', 'defaultItem'],
    });
    onSubmit.mockClear();

    userEvent.click(screen.getAllByText('REMOVE')[1]);
    userEvent.click(screen.getByText('Submit'));

    expect(onSubmit).toHaveBeenCalledWith({
      nicePeople: ['defaultItem'],
    });
    onSubmit.mockClear();

    expect(() => userEvent.click(screen.getByText('REMOVE'))).toThrow();
    userEvent.click(screen.getByText('Submit'));

    expect(onSubmit).toHaveBeenCalledWith({
      nicePeople: ['defaultItem'],
    });
  });

  it('shows error', async () => {
    initialProps = {
      ...initialProps,
      schema: {
        fields: [
          {
            component: componentTypes.FIELD_ARRAY,
            name: 'nicePeople',
            validate: [{ type: validatorTypes.MIN_ITEMS, threshold: 3 }],
            fields: [
              {
                component: componentTypes.TEXT_FIELD,
              },
            ],
          },
        ],
      },
    };

    render(<FormRenderer {...initialProps} />);

    expect(() => screen.getByText('Must have at least 3 items.')).toThrow();

    userEvent.click(screen.getByText('ADD'));
    userEvent.click(screen.getByText('Submit'));

    expect(onSubmit).not.toHaveBeenCalled();
    onSubmit.mockClear();

    expect(screen.getByText('Must have at least 3 items.')).toBeInTheDocument();
  });

  it('allow to revert removal', async () => {
    initialProps = {
      ...initialProps,
      schema: {
        fields: [
          {
            component: componentTypes.FIELD_ARRAY,
            name: 'nicePeople',
            defaultItem: { name: 'enter a name', lastName: 'enter a last name' },
            fields: [
              {
                component: componentTypes.TEXT_FIELD,
              },
            ],
          },
        ],
      },
    };

    render(<FormRenderer {...initialProps} />);

    userEvent.click(screen.getByText('ADD'));
    userEvent.click(screen.getByText('Submit'));

    expect(onSubmit).toHaveBeenCalledWith({
      nicePeople: [{ name: 'enter a name', lastName: 'enter a last name' }],
    });

    onSubmit.mockClear();

    userEvent.click(screen.getByText('REMOVE'));
    userEvent.click(screen.getByText('Submit'));

    expect(onSubmit).toHaveBeenCalledWith({
      nicePeople: [],
    });

    onSubmit.mockClear();

    userEvent.click(screen.getByLabelText('undo'));
    userEvent.click(screen.getByText('Submit'));

    expect(onSubmit).toHaveBeenCalledWith({
      nicePeople: [{ name: 'enter a name', lastName: 'enter a last name' }],
    });

    onSubmit.mockClear();

    userEvent.click(screen.getByLabelText('redo'));
    userEvent.click(screen.getByText('Submit'));

    expect(onSubmit).toHaveBeenCalledWith({
      nicePeople: [],
    });

    userEvent.click(screen.getByLabelText('undo'));
    userEvent.click(screen.getByText('Submit'));

    expect(onSubmit).toHaveBeenCalledWith({
      nicePeople: [{ name: 'enter a name', lastName: 'enter a last name' }],
    });

    userEvent.click(screen.getByText('ADD'));
    expect(screen.getByLabelText('undo')).toHaveAttribute('aria-disabled', 'true'); // ADD resets history
  });

  it('reducer - default state', () => {
    const initialState = { aa: 'aa' };

    expect(reducer(initialState, { type: 'nonsense' })).toEqual(initialState);
  });
});
