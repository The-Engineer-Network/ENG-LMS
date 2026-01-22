import { supabase } from './supabase'

export interface UploadResult {
  url: string
  path: string
  error?: string
}

// Profile Picture Upload
export async function uploadProfilePicture(userId: string, file: File): Promise<UploadResult> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/avatar.${fileExt}`
    
    // Delete existing profile picture if it exists
    await supabase.storage
      .from('profile-pictures')
      .remove([fileName])
    
    const { data, error } = await supabase.storage
      .from('profile-pictures')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName)

    // Update profile with new picture URL
    await supabase
      .from('profiles')
      .update({ profile_picture_url: publicUrl })
      .eq('id', userId)

    return { url: publicUrl, path: data.path }
  } catch (error: any) {
    return { url: '', path: '', error: error.message }
  }
}

// Chat File Upload
export async function uploadChatFile(senderId: string, recipientId: string, file: File): Promise<UploadResult> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${senderId}/${recipientId}/${Date.now()}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('chat-files')
      .upload(fileName, file)

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('chat-files')
      .getPublicUrl(fileName)

    return { url: publicUrl, path: data.path }
  } catch (error: any) {
    return { url: '', path: '', error: error.message }
  }
}

// Certificate Upload (Admin only)
export async function uploadCertificate(studentId: string, file: File): Promise<UploadResult> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${studentId}/certificate.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('certificates')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('certificates')
      .getPublicUrl(fileName)

    return { url: publicUrl, path: data.path }
  } catch (error: any) {
    return { url: '', path: '', error: error.message }
  }
}

// Task Submission File Upload
export async function uploadTaskSubmissionFile(studentId: string, submissionId: string, file: File): Promise<UploadResult> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${studentId}/${submissionId}/${Date.now()}-${file.name}`
    
    const { data, error } = await supabase.storage
      .from('task-submissions')
      .upload(fileName, file)

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('task-submissions')
      .getPublicUrl(fileName)

    // Save file record to database
    await supabase
      .from('task_submission_files')
      .insert({
        submission_id: submissionId,
        file_name: file.name,
        file_path: data.path,
        file_size: file.size,
        file_type: file.type
      })

    return { url: publicUrl, path: data.path }
  } catch (error: any) {
    return { url: '', path: '', error: error.message }
  }
}

// Download File
export async function downloadFile(bucket: string, path: string): Promise<Blob | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path)

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error downloading file:', error)
    return null
  }
}

// Delete File
export async function deleteFile(bucket: string, path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting file:', error)
    return false
  }
}

// Get File URL
export function getFileUrl(bucket: string, path: string): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)
  
  return data.publicUrl
}

// Validate File Type and Size
export function validateFile(file: File, allowedTypes: string[], maxSizeMB: number): string | null {
  // Check file type
  const fileType = file.type.toLowerCase()
  const isValidType = allowedTypes.some(type => 
    fileType.includes(type.toLowerCase()) || 
    file.name.toLowerCase().endsWith(type.toLowerCase())
  )
  
  if (!isValidType) {
    return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return `File size too large. Maximum size: ${maxSizeMB}MB`
  }

  return null
}

// Format File Size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Certificate file download
export async function downloadCertificateFile(certificateUrl: string, fileName: string) {
  try {
    const response = await fetch(certificateUrl)
    const blob = await response.blob()
    
    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName || 'certificate.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    return { success: true }
  } catch (error) {
    console.error('Error downloading certificate:', error)
    throw error
  }
}