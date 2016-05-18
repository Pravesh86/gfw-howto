module Jekyll
  class FaqsSortedPosts < Jekyll::Generator
    safe true
    priority :lowest

    def generate(site)
      sorted_posts = []

      site.posts.docs.each do |post|
        # First remove all posts that belong to the 'faqs' category
        sorted_posts << post if post['categories'].include? 'faqs'
      end

      # # Then sort em according to ...
      sorted_posts = sorted_posts.sort{ |a,b| a.data["title"] <=> b.data["title"] } 

      site.config["faqs_sorted_posts"] = sorted_posts
    end
  end
end