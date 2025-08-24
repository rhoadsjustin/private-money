import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const OnboardingSlide = ({ question, onNext }) => {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    onNext(value);
    setValue('');
  };

  const handleSkip = () => {
    onNext(null);
    setValue('');
  };

  return (
    <View style={styles.slide}>
      <View style={styles.content}>
        <Text style={styles.title}>{question.title}</Text>
        <Text style={styles.description}>{question.description}</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.prefix}>{question.prefix}</Text>
          <TextInput
            style={styles.input}
            placeholder={question.placeholder}
            value={value}
            onChangeText={setValue}
            keyboardType="numeric"
            placeholderTextColor="#A0AEC0"
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>{question.skipText}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleSubmit}>
          <Text style={styles.nextButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1A202C',
  },
  description: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F7FAFC',
  },
  prefix: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4A5568',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 20,
    color: '#2D3748',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  skipButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  skipButtonText: {
    textAlign: 'center',
    color: '#718096',
    fontWeight: '500',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#4299E1',
    padding: 16,
    borderRadius: 12,
    marginLeft: 8,
  },
  nextButtonText: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default OnboardingSlide;
