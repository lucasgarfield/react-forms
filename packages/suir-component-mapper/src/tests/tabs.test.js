import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import FormTabs from '../tabs';
import RenderWithProvider from '../../../../__mocks__/with-provider';
import { FormRenderer, validatorTypes } from '@data-driven-forms/react-form-renderer';
import { componentMapper, FormTemplate } from '../index';

describe('tabs', () => {
  const props = {
    fields: [
      {
        title: 'cosiTitle',
        name: 'cosiName',
        fields: [],
      },
      {
        title: 'cosiTitle2',
        name: 'cosiName2',
        fields: [],
      },
    ],
  };

  const formOptions = {
    renderForm: jest.fn().mockImplementation(() => <h1>Content</h1>),
  };

  it('should render tabs correctly', () => {
    render(
      <RenderWithProvider value={{ formOptions }}>
        <FormTabs {...props} />
      </RenderWithProvider>
    );

    expect(screen.getAllByText('Content')).toHaveLength(2);
    expect(screen.getByText('cosiTitle')).toBeInTheDocument();
    expect(screen.getByText('cosiTitle2')).toBeInTheDocument();
  });

  it('should switch tabs correctly', () => {
    render(
      <RenderWithProvider value={{ formOptions }}>
        <FormTabs {...props} />
      </RenderWithProvider>
    );

    expect(screen.getByText('cosiTitle')).toHaveClass('active item');

    userEvent.click(screen.getByText('cosiTitle2'));

    expect(screen.getByText('cosiTitle2')).toHaveClass('active item');
  });

  it('validate all tabs', () => {
    const onSubmit = jest.fn();
    render(
      <FormRenderer
        componentMapper={componentMapper}
        FormTemplate={(props) => <FormTemplate {...props} />}
        onSubmit={(values) => onSubmit(values)}
        schema={{
          fields: [
            {
              component: 'tabs',
              name: 'tabs1',
              title: 'tabs1',
              fields: [
                {
                  name: 'tabitem1',
                  component: 'tab-item',
                  fields: [
                    {
                      component: 'text-field',
                      name: 'name',
                      validate: [{ type: validatorTypes.REQUIRED }],
                      'aria-label': 'name',
                    },
                  ],
                },
                {
                  name: 'tabitem2',
                  component: 'tab-item',
                  fields: [
                    {
                      component: 'text-field',
                      name: 'password',
                      validate: [{ type: validatorTypes.REQUIRED }],
                      'aria-label': 'password',
                    },
                  ],
                },
              ],
            },
          ],
        }}
      />
    );

    userEvent.type(screen.getByLabelText('name'), 'NAME');
    userEvent.click(screen.getByText('Submit'));

    expect(onSubmit).not.toHaveBeenCalled();

    userEvent.type(screen.getByLabelText('password'), 'PASSWORD');
    userEvent.click(screen.getByText('Submit'));

    expect(onSubmit).toHaveBeenCalledWith({ name: 'NAME', password: 'PASSWORD' });
  });
});
