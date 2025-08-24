import { type Message, useRAG } from 'react-native-rag';
import {
  ALL_MINILM_L6_V2,
  ALL_MINILM_L6_V2_TOKENIZER,
  LLAMA3_2_1B_QLORA,
  LLAMA3_2_1B_TOKENIZER,
  LLAMA3_2_TOKENIZER_CONFIG,
} from 'react-native-executorch';
import { useEffect, useMemo, useState } from 'react';
import { OPSQLiteVectorStore } from '@react-native-rag/op-sqlite';
import { ExecuTorchEmbeddings, ExecuTorchLLM } from '@react-native-rag/executorch';
import { KeyboardAvoidingView, Text, View, StyleSheet, Platform, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessagesList } from '~/components/MessagesList';
import { ChatInput } from '~/components/ChatInput';
import { DocumentModal } from '~/components/DocumentModal';
import { useBudgetStore } from '~/store/useLocalBudgetStore';

export default function App() {
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [document, setDocument] = useState<string>('');
  const [ids, setIds] = useState<string[]>([]);
  const [augmentedGeneration, setAugmentedGeneration] = useState(true);
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const insets = useSafeAreaInsets();

  const vectorStore = useMemo(() => {
    return new OPSQLiteVectorStore({
      name: 'budget-db',
      embeddings: new ExecuTorchEmbeddings({
        modelSource: ALL_MINILM_L6_V2,
        tokenizerSource: ALL_MINILM_L6_V2_TOKENIZER,
      }),
    });
  }, []);

  const llm = useMemo(() => {
    return new ExecuTorchLLM({
      modelSource: LLAMA3_2_1B_QLORA,
      tokenizerSource: LLAMA3_2_1B_TOKENIZER,
      tokenizerConfigSource: LLAMA3_2_TOKENIZER_CONFIG,
      onDownloadProgress: setDownloadProgress,
    });
  }, []);

  const rag = useRAG({ vectorStore, llm });
  const { income, fixedExpenses } = useBudgetStore();
  useEffect(() => {
    setupBudgetInfo();
  }, [rag.isReady]);

  const setupBudgetInfo = async () => {
    if (!rag.isReady) {
      console.error('RAG is not initialized');
      Alert.alert('Error', 'RAG system is not ready. Please try again.');
      return;
    }
    try {
      // Calculate total fixed expenses
      const totalFixedExpenses = fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const remainingIncome = income - totalFixedExpenses;

      // Create a comprehensive financial profile
      const document = `
        # Financial Profile

        ## Income
        My gross monthly income is $${income.toFixed(2)}.

        ## Fixed Expenses
        I have the following fixed monthly expenses:
        ${fixedExpenses.map((expense) => `- ${expense.name}: $${expense.amount.toFixed(2)}`).join('\n')}

        Total fixed expenses: $${totalFixedExpenses.toFixed(2)}

        ## Budget Summary
        After fixed expenses, I have $${remainingIncome.toFixed(2)} remaining for variable expenses, savings, and investments.

        ## Location
        I live in Texas, which has no state income tax.
      `;

      const newIds = await rag.splitAddDocument(document);
      setIds(newIds);
      console.log('Budget information added with IDs:', newIds);
    } catch (error) {
      console.error('Error adding/modifying financial information:', error);
      Alert.alert('Error', 'Failed to add financial information. Please try again.');
    }
  };

  const modifyDocument = async () => {
    if (!rag.isReady) {
      console.error('RAG is not initialized');
      Alert.alert('Error', 'RAG system is not ready. Please try again.');
      return;
    }
    try {
      if (ids.length) {
        for (const id of ids) {
          await rag.deleteDocument(id);
        }
        setIds([]);
      }
      const newIds = await rag.splitAddDocument(document);
      setIds(newIds);
      console.log('Document splitted and added with IDs:', newIds);
      setModalVisible(false);
    } catch (error) {
      console.error('Error adding/modifying document:', error);
      Alert.alert('Error', 'Failed to add/modify document. Please try again.');
    }
  };

  const handleMessageSubmit = async () => {
    if (!rag.isReady) {
      console.warn('RAG not ready');
      return;
    }
    if (!message.trim()) {
      console.warn('Message is empty');
      return;
    }

    const newMessage: Message = {
      role: 'user',
      content: message,
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setMessage('');

    try {
      const result = await rag.generate([...messages, newMessage], {
        augmentedGeneration,
      });
      setMessages((prevMessages) => [...prevMessages, { role: 'assistant', content: result }]);
    } catch (error) {
      console.error('Error generating response:', error);
      Alert.alert('Error', 'Failed to generate response. Please try again.');
    }
  };

  const openDocumentModal = () => {
    setModalVisible(true);
  };

  const handleAugmentedGeneration = () => {
    setAugmentedGeneration((prev) => !prev);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={appStyles.safeArea}>
        <View style={appStyles.chatContainer}>
          {messages.length > 0 ? (
            <MessagesList
              messages={messages}
              response={rag.response}
              isGenerating={rag.isGenerating}
            />
          ) : !rag.isReady ? (
            <View style={appStyles.loadingContainer}>
              <Text style={appStyles.loadingText}>
                Loading {(downloadProgress * 100).toFixed(2)}%
              </Text>
            </View>
          ) : (
            <View style={appStyles.emptyStateContainer}>
              <Text style={appStyles.emptyStateTitle}>Hello! 👋</Text>
              <Text style={appStyles.emptyStateSubtitle}>What can I help you with?</Text>
            </View>
          )}
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={insets.bottom + 12}>
          <ChatInput
            message={message}
            onMessageChange={setMessage}
            onAddDocument={openDocumentModal}
            onToggleAugmentedGeneration={handleAugmentedGeneration}
            onMessageSubmit={handleMessageSubmit}
            augmentedGeneration={augmentedGeneration}
            isGenerating={rag.isGenerating}
            isReady={rag.isReady}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
      <DocumentModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        ids={ids}
        document={document}
        onDocumentChange={setDocument}
        onModifyDocument={modifyDocument}
      />
    </SafeAreaProvider>
  );
}

const appStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerIcon: {
    alignSelf: 'center',
    marginVertical: 8,
  },
  chatContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 20,
    textAlign: 'center',
  },
});
