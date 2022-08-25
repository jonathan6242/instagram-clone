import { useNavigate } from "react-router-dom"

function PostThumbnail({ post }) {
  const navigate = useNavigate();

  return (
    <div className="pb-[100%] relative overflow-hidden cursor-pointer
    bg-cover bg-no-repeat bg-center"
    style={{
      backgroundImage: `url(${post?.photos[0]})`
    }}
    onClick={() => navigate(`/profile/${post?.uid}/post/${post?.id}`)}
    >
    </div>
  )
}
export default PostThumbnail