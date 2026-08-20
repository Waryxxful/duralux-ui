import React from 'react'
import {
  EMPTY_OPTIONS,
  isSelectValue,
  safeString,
  valueToken,
} from './selectCoreModel'
import { isArray, isNonEmptyString } from '../../../utils/typeGuards'

export function HiddenValues({ name, values, disabled = false }) {
  if (!isNonEmptyString(name)) return null
  const safeValues = isArray(values) ? values : EMPTY_OPTIONS
  return safeValues.reduce((inputs, value) => {
    if (isSelectValue(value)) {
      inputs.push(<input key={valueToken(value)} type="hidden" name={name} value={safeString(value)} disabled={disabled} />)
    }
    return inputs
  }, [])
}
