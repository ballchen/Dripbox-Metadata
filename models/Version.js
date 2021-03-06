exports.Version = {
  id: String,
  nodeId: String,
  checkSum: String, // (Hash the file using MD5)
  s3Url: String,
  author: String, // (user's id)
  uploaded: {
    type: Boolean,
    default: false
  },
  createdAt: Date,
  updatedAt: Date
}
