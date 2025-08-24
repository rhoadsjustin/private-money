import { useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useBudgetStore } from '~/store/useLocalBudgetStore';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressBar from '~/components/ProgressBar';
import OnboardingSlide from '~/components/OnboardingSlide';

const { width } = Dimensions.get('window');

const financialQuestions = [
  {
    id: 'netIncome',
    title: 'Monthly Income',
    description: 'How much do you earn per month after taxes?',
    placeholder: '$4000',
    prefix: '$',
    skipText: "I don't have income",
  },
  {
    id: 'housing',
    title: 'Housing',
    description: 'How much do you pay for rent or mortgage monthly?',
    placeholder: '$1500',
    prefix: '$',
    skipText: "I don't pay for housing",
  },
  {
    id: 'utilities',
    title: 'Utilities',
    description: 'Your monthly costs for electricity, water, gas, etc.',
    placeholder: '$200',
    prefix: '$',
    skipText: 'Not applicable',
  },
  {
    id: 'phone',
    title: 'Cell Phone',
    description: 'Your monthly cell phone bill',
    placeholder: '$80',
    prefix: '$',
    skipText: "I don't have a cell phone",
  },
  {
    id: 'carInsurance',
    title: 'Car Insurance',
    description: 'Your monthly car insurance payment',
    placeholder: '$120',
    prefix: '$',
    skipText: "I don't have a car",
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [financialData, setFinancialData] = useState({});
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();
  const { setIncome, addFixedExpense } = useBudgetStore();

  const handleNext = (value) => {
    // Save the current value
    if (value) {
      setFinancialData((prev) => ({
        ...prev,
        [financialQuestions[currentIndex].id]: parseFloat(value),
      }));
    }

    // Animate current slide out
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Move to next question or finish
      if (currentIndex < financialQuestions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        slideAnim.setValue(width);

        // Animate next slide in
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        finishOnboarding();
      }
    });
  };

  const finishOnboarding = () => {
    // Process all financial data
    if (financialData.netIncome) {
      setIncome(financialData.netIncome);
    }

    // Add each expense to the store
    Object.entries(financialData).forEach(([key, value]) => {
      if (key !== 'netIncome' && value) {
        addFixedExpense(key, value);
      }
    });

    // Navigate to the main app
    router.navigate('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}>
        <ProgressBar total={financialQuestions.length} current={currentIndex} />

        <Animated.View
          style={[
            styles.slideContainer,
            {
              opacity: opacityAnim,
              transform: [{ translateX: slideAnim }],
            },
          ]}>
          <OnboardingSlide question={financialQuestions[currentIndex]} onNext={handleNext} />
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoid: {
    flex: 1,
  },
  slideContainer: {
    flex: 1,
    width: width,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#718096',
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  pageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E0',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#4299E1',
  },
});
