'use client';

import { forwardRef, useMemo, useRef, useImperativeHandle, type ReactElement, type RefAttributes, type ForwardedRef } from 'react';
import CreatableSelect from "react-select/creatable";
import Select, { type GroupBase, type Props, type SelectInstance, type StylesConfig, type OnChangeValue, type ActionMeta } from "react-select";

const OTHERS_OPTION_VALUE = '____CUSTOM_OTHERS_OPTION_TRIGGER____';
const TODOS_OPTION_VALUE = '____CUSTOM_TODOS_OPTION_TRIGGER____';

export interface CustomSelectProps<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
> extends Props<Option, IsMulti, Group> {
  isCreatable?: boolean;
  onCreateOption?: (inputValue: string) => void;
  formatCreateLabel?: (inputValue: string) => string;
  otherLabel?: string;
  allLabel?: string;
}

const isOthersOption = (opt: unknown): boolean => {
  return (
    typeof opt === 'object' &&
    opt !== null &&
    'value' in opt &&
    opt.value === OTHERS_OPTION_VALUE
  );
};

const isAllOption = (opt: unknown): boolean => {
  return (
    typeof opt === 'object' &&
    opt !== null &&
    'value' in opt &&
    opt.value === TODOS_OPTION_VALUE
  );
};

function InnerCustomReactSelect<Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(
  props: CustomSelectProps<Option, IsMulti, Group>,
  ref: ForwardedRef<SelectInstance<Option, IsMulti, Group>>
) {
  const {
    isCreatable,
    onCreateOption,
    formatCreateLabel,
    otherLabel = 'OTRO (Escribir nuevo...)',
    allLabel = 'TODOS',
    options,
    onChange,
    ...selectProps
  } = props;

  const selectRef = useRef<SelectInstance<Option, IsMulti, Group>>(null);

  useImperativeHandle(ref, () => selectRef.current!);

  const isAllOthersSelected = useMemo(() => {
    if (!selectProps.isMulti || !options || !selectProps.value) return false;
    const selectedValues = Array.isArray(selectProps.value)
      ? selectProps.value
      : [selectProps.value];
    if (selectedValues.length === 0) return false;
    const getValue = (item: unknown): unknown =>
      typeof item === 'object' && item !== null && 'value' in item
        ? (item as Record<string, unknown>).value
        : item;
    return options.every((opt) =>
      selectedValues.some((sel) => getValue(sel) === getValue(opt))
    );
  }, [selectProps.isMulti, options, selectProps.value]);

  const computedOptions = useMemo(() => {
    if (!options) return options;

    const allOption = {
      label: allLabel,
      value: TODOS_OPTION_VALUE,
    };
    const othersOption = {
      label: otherLabel,
      value: OTHERS_OPTION_VALUE,
    };
    const shouldAddAll = selectProps.isMulti && !isAllOthersSelected;
    const shouldAddOthers = isCreatable;

    let result = [...options] as typeof options;

    if (shouldAddAll) {
      result = [allOption, ...result] as typeof options;
    }
    if (shouldAddOthers) {
      result = [...result, othersOption] as typeof options;
    }

    return result;
  }, [options, selectProps.isMulti, isAllOthersSelected, isCreatable, allLabel, otherLabel]);

  const handleChange = (
    newValue: OnChangeValue<Option, IsMulti>,
    actionMeta: ActionMeta<Option>
  ) => {
    const options = computedOptions?.filter((opt) => !isAllOption(opt)) || [];

    const isAllSelected = Array.isArray(newValue)
      ? newValue.some(isAllOption)
      : isAllOption(newValue);

    const isOthersSelected = Array.isArray(newValue)
      ? newValue.some(isOthersOption)
      : isOthersOption(newValue);

    if (isOthersSelected) {
      const ref = selectRef.current;
      setTimeout(() => {
        if (ref) {
          ref.focus();
          ref.inputRef?.style.setProperty("opacity", "1");
        }

      }, 50);

      if (onChange) {
        if (Array.isArray(newValue)) {
          const filteredValue = newValue.filter(
            (opt) => !isOthersOption(opt)
          );
          onChange(filteredValue as OnChangeValue<Option, IsMulti>, actionMeta);
        } else {
          const clearMeta: ActionMeta<Option> = {
            action: 'clear',
            removedValues: [],
            name: actionMeta.name,
          };

          onChange(null as OnChangeValue<Option, IsMulti>, clearMeta);
        }
      }
      return;
    }

    if (isAllSelected) {
      // llamar onChange con TODAS las options
      if(onChange) {
        onChange(options as OnChangeValue<Option, IsMulti>, actionMeta);
      }
      return;
    }

    if (onChange) {
      onChange(newValue, actionMeta);
    }
  };

  const customStyles = useMemo<StylesConfig<Option, IsMulti, Group> | undefined>(() => {
    return {
      container: (base) => ({
        ...base,
        width: '100%',
        minWidth: 0,
      }),
      control: (base, state) => {
        if (state.isDisabled) {
          return {
            ...base,
            width: '100%',
            maxWidth: '100%',
            minWidth: '0',
            overflow: 'hidden',
            backgroundColor: 'var(--color-muted)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-muted-foreground)',
            cursor: 'not-allowed',
            opacity: 0.6,
          };
        }

        return {
          ...base,
          width: '100%',
          maxWidth: '100%',
          minWidth: '0',
          overflow: 'hidden',
          backgroundColor: 'var(--color-background)',
          color: 'var(--color-foreground)',
          borderColor: state.isFocused ? 'var(--color-ring)' : 'var(--color-input)',
          boxShadow: state.isFocused ? '0 0 0 1px var(--color-ring)' : 'none',
          '&:hover': {
            borderColor: 'var(--color-ring)',
          },
        };
      },
      valueContainer: (base, state) => ({
        ...base,
        minWidth: 0,
        flexWrap: 'wrap',
        color: state.isDisabled ? 'var(--color-muted-foreground)' : 'var(--color-foreground)',
      }),
      input: (base, state) => ({
        ...base,
        minWidth: 0,
        color: state.isDisabled ? 'var(--color-muted-foreground)' : 'var(--color-foreground)',
      }),
      placeholder: (base) => ({
        ...base,
        maxWidth: '100%',
        color: 'var(--color-muted-foreground)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }),
      singleValue: (base, state) => ({
        ...base,
        maxWidth: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        color: state.isDisabled ? 'var(--color-muted-foreground)' : 'var(--color-foreground)',
      }),
      multiValue: (base, state) => ({
        ...base,
        maxWidth: '100%',
        backgroundColor: state.isDisabled ? 'var(--color-muted)' : 'var(--color-secondary)',
      }),
      multiValueLabel: (base, state) => ({
        ...base,
        maxWidth: '100%',
        minWidth: '0',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        color: state.isDisabled ? 'var(--color-muted-foreground)' : 'var(--color-secondary-foreground)',
      }),
      multiValueRemove: (base, state) => ({
        ...base,
        color: state.isDisabled ? 'var(--color-muted-foreground)' : 'var(--color-secondary-foreground)',
        ':hover': state.isDisabled ? {} : {
          backgroundColor: 'var(--color-destructive)',
          color: 'var(--color-primary-foreground)',
        },
      }),
      dropdownIndicator: (base, state) => ({
        ...base,
        color: 'var(--color-muted-foreground)',
        cursor: state.isDisabled ? 'not-allowed' : 'pointer',
        ':hover': state.isDisabled ? {} : {
          color: 'var(--color-foreground)',
        },
      }),
      clearIndicator: (base) => ({
        ...base,
        color: 'var(--color-muted-foreground)',
        cursor: selectProps.isDisabled ? 'not-allowed' : 'pointer',
        ':hover': selectProps.isDisabled ? {} : {
          color: 'var(--color-foreground)',
        },
      }),
      menu: (base) => ({
        ...base,
        backgroundColor: 'var(--color-popover)',
        color: 'var(--color-popover-foreground)',
        border: '1px solid var(--color-border)',
      }),
      menuList: (base) => ({
        ...base,
        padding: '4px',
      }),
      option: (base, { isFocused, isSelected, isDisabled, data }) => {
        if (isDisabled) {
          return {
            ...base,
            backgroundColor: 'transparent',
            color: 'var(--color-muted-foreground)',
            cursor: 'not-allowed',
          };
        }

        let backgroundColor = 'transparent';
        if (isSelected || isFocused) {
          backgroundColor = 'var(--color-accent)';
        }

        const isOthers = isOthersOption(data);

        return {
          ...base,
          backgroundColor,
          maxWidth: '100%',
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          color: isSelected || isFocused ? 'var(--color-accent-foreground)' : 'var(--color-popover-foreground)',
          cursor: 'pointer',
          fontWeight: isOthers ? '600' : 'normal',
          borderTop: isOthers ? '1px solid var(--color-border)' : 'none',
          ':active': {
            backgroundColor: 'var(--color-accent)',
          },
        };
      },
      indicatorSeparator: (base) => ({
        ...base,
        backgroundColor: 'var(--color-border)',
      }),
    };
  }, [selectProps.isDisabled]);

  const commonProps = {
    ref: selectRef,
    styles: customStyles,
    options: computedOptions,
    onChange: handleChange,
    ...selectProps,
  };

  if (isCreatable) {
    return (
      <CreatableSelect<Option, IsMulti, Group>
        {...commonProps}
        onCreateOption={onCreateOption}
        formatCreateLabel={formatCreateLabel ?? ((inputValue) => `Crear "${inputValue}"`)}
      />
    );
  }

  return (
    <Select<Option, IsMulti, Group>
      {...commonProps}
    />
  );
}

const CustomReactSelect = forwardRef(InnerCustomReactSelect) as <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(
  props: CustomSelectProps<Option, IsMulti, Group> & RefAttributes<SelectInstance<Option, IsMulti, Group>>
) => ReactElement;

export default CustomReactSelect;
