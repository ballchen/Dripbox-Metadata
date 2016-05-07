exports.Node = {
  id: String,
  name: String,
  publicLevel: Number,
  collaborator: Array,
  type: String, // dir or file
  link: String,
  currentVersion: String, // version id
  shortLink: String,
  originId: String, 
  deleted: {
    type: Boolean,
    default: false
  },
  uploaded: {
    type: Boolean, 
    default: false
  },
  createdAt: Date,
  updatedAt: Date
}