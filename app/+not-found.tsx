import { View, Text } from 'react-native';
import { Colors } from '../constants/colors';

export default function NotFound() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.darkNavy }}>
      <Text style={{ color: Colors.white, fontSize: 18 }}>Page not found.</Text>
    </View>
  );
}
