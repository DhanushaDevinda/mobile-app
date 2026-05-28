import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name='settings'>
        <Icon sf='gear' drawable='custom_settings_drawable' />
        <Label>Settings</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name='index'>
        <Label>Home</Label>
        <Icon sf='house.fill' drawable='custom_android_drawable' />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name='profile'>
        <Icon sf='person.fill' drawable='custom_person_drawable' />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
