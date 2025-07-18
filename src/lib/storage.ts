import { supabase } from './supabaseClient'

export async function uploadFile(file: File, bucket: string): Promise<string> {
  try {
    // Generate a unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file)

    if (error) {
      throw error
    }

    if (!data) {
      throw new Error('Upload failed - no data returned')
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    if (!urlData?.publicUrl) {
      throw new Error('Could not get public URL for uploaded file')
    }

    return urlData.publicUrl
  } catch (error) {
    console.error('Error uploading file:', error)
    throw new Error('Failed to upload file')
  }
}