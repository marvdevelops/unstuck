import { Redirect } from 'expo-router';
import { useUserStore } from '../store/useUserStore';

export default function Index() {
  const onboardingComplete = useUserStore((s) => s.onboardingComplete);
  return <Redirect href={onboardingComplete ? '/(app)/' : '/(auth)/welcome'} />;
}
