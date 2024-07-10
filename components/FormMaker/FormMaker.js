import React, { useCallback } from 'react';
import { Cross1Icon } from '@radix-ui/react-icons';
import Button from 'components/ui/Button';
import { Divider } from 'components/ui/Divider';
import { Flex } from 'components/ui/Flex';
import Input from 'components/ui/Input';
import InputHelper from 'components/ui/InputHelper';
import { Select } from 'components/ui/Select';
import Switch, { SwitchThumb } from 'components/ui/Switch';
import Tag from 'components/ui/Tag';
import { Field, FieldArray } from 'formik';
import { styled } from 'styles/stitches.config';
import { PROVIDER_RECEIVE, PROVIDER_SIMULCAST } from 'utils/constants';

const StyledSimulcastContainer = styled('div', {
  display: 'flex',
  flexFlow: 'column wrap',
  rowGap: '$3',
});

const StyledSimulcastRow = styled('div', {
  display: 'flex',

  input: {
    borderRadius: 0,
    '&:first-of-type': {
      borderRight: 0,
      borderRadius: '$default 0 0 $default',
    },
    '&:last-of-type': {
      borderLeft: 0,
      borderRadius: '0 $default $default 0',
      mr: '$3',
    },
  },
});

export const FormMaker = ({ values, fields, setFieldValue }) => {
  const handleChange = useCallback(
    (field, e) => {
      if (field.type === 'switch') {
        setFieldValue(field.name, e);
        field.onChange && field.onChange(e, values, setFieldValue);
      } else {
        setFieldValue(field.name, e.target.value);
        field.onChange && field.onChange(e, values, setFieldValue);
      }
    },
    [setFieldValue, values]
  );

  const renderField = useCallback(
    (field) => {
      const show =
        typeof field.show === 'function' ? field.show(values) : field.show;
      if (!(show ?? true)) return null;

      const disabled =
        typeof field.disabled === 'function'
          ? field.disabled(values)
          : field.disabled;

      switch (field.type) {
        case 'text':
          return (
            <Flex
              key={field.name}
              css={{ flexFlow: 'column wrap', rowGap: '$3' }}
            >
              <label htmlFor={field.name}>
                {field.label} {field.required && <Tag>Required</Tag>}
              </label>
              <Field
                name={field.name}
                component={Input}
                id={field.name}
                placeholder={field.placeholder}
                disabled={disabled}
              />
            </Flex>
          );
        case 'number':
          return (
            <Flex
              key={field.name}
              css={{ flexFlow: 'column wrap', rowGap: '$3' }}
            >
              <label htmlFor={field.name}>
                {field.label} {field.required && <Tag>Required</Tag>}
              </label>
              <Field
                name={field.name}
                component={Input}
                id={field.name}
                placeholder={field.placeholder}
                type="number"
                disabled={disabled}
              />
            </Flex>
          );
        case 'select':
          return (
            <Flex
              key={field.name}
              css={{ flexFlow: 'column wrap', rowGap: '$3' }}
            >
              <label htmlFor={field.name}>{field.label}</label>
              {field.subText && <span>{field.subText}</span>}
              <Select
                name={field.name}
                disabled={disabled}
                onChange={(e) => handleChange(field, e)}
              >
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Flex>
          );
        case 'videoConstraints':
          return (
            <Flex
              key={field.name}
              css={{ flexFlow: 'row nowrap', columnGap: '$3' }}
            >
              <Flex
                css={{
                  flex: 1,
                  flexFlow: 'column wrap',
                  rowGap: '$3',
                }}
              >
                <label htmlFor="videoConstraintsWidth">
                  Width <Tag>Required</Tag>
                </label>
                <Field
                  name="videoConstraints.width"
                  component={Input}
                  id="videoConstraints.width"
                  placeholder="1280"
                  type="number"
                />
              </Flex>
              <Flex
                css={{
                  flex: 1,
                  flexFlow: 'column wrap',
                  rowGap: '$3',
                }}
              >
                <label htmlFor="sendSettingsLow">
                  Height <Tag>Required</Tag>
                </label>
                <Field
                  name="videoConstraints.height"
                  component={Input}
                  id="videoConstraints.height"
                  placeholder="720"
                  type="number"
                />
              </Flex>
            </Flex>
          );
        case 'switch':
          return (
            <Flex
              key={field.name}
              css={{
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <label htmlFor={field.name}>
                {field.label}
                {field?.inputHelper && <InputHelper text={field.inputHelper} />}
              </label>
              <Switch
                name={field.name}
                defaultChecked={field.defaultChecked}
                id={field.name}
                disabled={disabled}
                onCheckedChange={(v) => handleChange(field, v)}
              >
                <SwitchThumb />
              </Switch>
            </Flex>
          );
        case 'divider':
          return <Divider />;
        case 'receiveSettings':
          return (
            <Flex
              key={field.name}
              css={{ flexFlow: 'row nowrap', columnGap: '$3' }}
            >
              {PROVIDER_RECEIVE[values?.provider || 'daily'] > 1 && (
                <Flex
                  css={{
                    flex: 1,
                    flexFlow: 'column wrap',
                    rowGap: '$3',
                  }}
                >
                  <label htmlFor="receiveSettingsMid">
                    Mid threshold: <Tag>Required</Tag>
                  </label>
                  <Field
                    name="receiveSettingsMid"
                    component={Input}
                    id="receiveSettingsMid"
                    placeholder="1-99"
                    type="number"
                  />
                </Flex>
              )}
              {PROVIDER_RECEIVE[values?.provider || 'daily'] >= 1 && (
                <Flex
                  css={{
                    flex: 1,
                    flexFlow: 'column wrap',
                    rowGap: '$3',
                  }}
                >
                  <label htmlFor="receiveSettingsLow">
                    Low threshold: <Tag>Required</Tag>
                  </label>
                  <Field
                    name="receiveSettingsLow"
                    component={Input}
                    id="receiveSettingsLow"
                    placeholder="1-99"
                    type="number"
                  />
                </Flex>
              )}
            </Flex>
          );
        case 'sendSideSettings':
          return (
            <Flex
              key={field.name}
              css={{ flexFlow: 'row nowrap', columnGap: '$3' }}
            >
              <Flex
                css={{
                  flex: 1,
                  flexFlow: 'column wrap',
                  rowGap: '$3',
                }}
              >
                <label htmlFor="sendSettingsHigh">
                  High cap (kbs) <Tag>Required</Tag>
                </label>
                <Field
                  name="sendSettingsHigh"
                  component={Input}
                  id="sendSettingsHigh"
                  placeholder="980"
                  type="number"
                />
              </Flex>
              <Flex
                css={{
                  flex: 1,
                  flexFlow: 'column wrap',
                  rowGap: '$3',
                }}
              >
                <label htmlFor="sendSettingsLow">
                  Low cap (kbs) <Tag>Required</Tag>
                </label>
                <Field
                  name="sendSettingsLow"
                  component={Input}
                  id="sendSettingsLow"
                  placeholder="300"
                  type="number"
                />
              </Flex>
            </Flex>
          );
        case 'customSimulcast':
          return (
            <FieldArray key={field.name} name="simulcast">
              {({ push, remove }) => (
                <StyledSimulcastContainer>
                  <h5>
                    {`Provider supports ${
                      PROVIDER_SIMULCAST[values?.provider]
                    } layers (highest first)`}
                  </h5>
                  {values.simulcast.length > 0 &&
                    values.simulcast.map((simulcast, index) => (
                      <StyledSimulcastRow key={index}>
                        <Field
                          name={`simulcast.${index}.bitrate`}
                          component={Input}
                          type="number"
                          step="1"
                          placeholder="Bitrate (kbps)"
                        />
                        <Field
                          name={`simulcast.${index}.frameRate`}
                          component={Input}
                          type="number"
                          step="1"
                          placeholder="Framerate"
                        />
                        <Field
                          name={`simulcast.${index}.downscale`}
                          component={Input}
                          type="number"
                          step="1"
                          placeholder="Downscale"
                        />
                        <Button
                          size="icon"
                          color="danger"
                          outlined
                          onClick={() => remove(index)}
                        >
                          <Cross1Icon />
                        </Button>
                      </StyledSimulcastRow>
                    ))}
                  <Button
                    disabled={
                      !(
                        values.simulcast.length <
                        PROVIDER_SIMULCAST[values.provider]
                      )
                    }
                    onClick={() =>
                      push({
                        downscale: '',
                        bitrate: '',
                        frameRate: '',
                      })
                    }
                  >
                    Add layer
                  </Button>
                </StyledSimulcastContainer>
              )}
            </FieldArray>
          );
      }
    },
    [handleChange, values]
  );

  return <>{fields.map((field) => renderField(field))}</>;
};
