import * as React from 'react';
import renderer from 'react-test-renderer';

import { MonoText } from '../StyledText';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  default: () => 'light',
  useColorScheme: () => 'light',
}));

it(`renders correctly`, async () => {
  let tree;

  await renderer.act(async () => {
    tree = renderer.create(<MonoText>Snapshot test!</MonoText>).toJSON();
  });

  expect(tree).toMatchSnapshot();
});
