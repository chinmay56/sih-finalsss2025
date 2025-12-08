import Layout from '@/components/Layout'
import TranslationInterface from '@/components/TranslationInterface'
import BulkUpload from '@/components/BulkUpload'

export default function TextTranslator() {
  return (
    <Layout>
      <TranslationInterface />
      <BulkUpload />
    </Layout>
  )
}