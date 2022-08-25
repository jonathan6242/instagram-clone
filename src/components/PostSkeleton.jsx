function PostSkeleton() {
  return (
    <div className="w-full bg-white dark:bg-dark1 xs:rounded-lg post relative shadow-lg">
    {/* Header */}
    <div className="p-4 px-5 justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-full animated-bg" ></div>
        <div className="font-semibold w-36 animated-bg">
          &nbsp;
        </div>
      </div>
    </div>
    {/* Swiper */}
    <div className="h-[440px] w-full animated-bg"></div>
    {/* Bottom Container */}
    <div className="px-5 py-4 md:pb-0 relative z-0">
      <div className="flex justify-between items-center mb-3">
        {/* Actions */}
        <div className="flex w-full space-x-4 text-2xl animated-bg rounded">
          &nbsp;
        </div>
      </div>
      <div className="my-4 font-semibold w-32 animated-bg rounded">&nbsp;</div>
      <p className="line-clamp-4 w-full h-10 animated-bg rounded">
      </p>
      <div className="mt-3 mb-5">
        &nbsp;
      </div>
    </div>
  </div>
  )
}
export default PostSkeleton