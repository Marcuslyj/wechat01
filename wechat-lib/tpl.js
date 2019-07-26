const ejs = require('ejs')

const tpl =
    `<xml>
    <ToUserName>
        <![CDATA[<%= toUserName %>]]>
    </ToUserName>
    <FromUserName>
        <![CDATA[<%= fromUserName %>]]>
    </FromUserName>
    <CreateTime><%= createTime %></CreateTime>
    <% if (msgType === 'text') { %>
    <MsgType>
        <![CDATA[text]]>
    </MsgType>
    <Content>
        <![CDATA[<%- content %>]]>
    </Content>
    <% } else if (msgType === 'image') { %>
    <MsgType><![CDATA[image]]></MsgType>
    <Image>
        <MediaId>
            <![CDATA[<%= content.mediaId %>]]>
        </MediaId>
    </Image>
    <% } else if (msgType === 'voice') { %>
    <Voice>
        <MediaId>
            <![CDATA[<%= content.mediaId %>]]>
        </MediaId>
    </Voice>
    <% } else if (msgType === 'video') { %>
    <MsgType><![CDATA[video]]></MsgType>
    <Video>
        <MediaId>
            <![CDATA[<%= content.mediaId %>]]>
        </MediaId>
        <Title>
            <![CDATA[<%= content.title %>]]>
        </Title>
        <Description>
            <![CDATA[<%= content.description %>]]>
        </Description>
    </Video>
    <% } else if (msgType === 'music') { %>
    <Music>
        <Title>
            <![CDATA[<%= content.title %>]]>
        </Title>
        <Description>
            <![CDATA[<%= content.description %>]]>
        </Description>
        <MusicUrl>
            <![CDATA[<%= content.musicUrl %>]]>
        </MusicUrl>
        <HQMusicUrl>
            <![CDATA[<%= content.hqMusicUrl %>]]>
        </HQMusicUrl>
        <ThumbMediaId>
            <![CDATA[<%= content.thumbMediaId %>]]>
        </ThumbMediaId>
    </Music>
    <% } 
    if (msgType === 'news') { %>
    <ArticleCount>
        <![CDATA[<%= content.length %>]]>
    </ArticleCount>
    <Articles>
        <% content.forEach(function(item){ %>
        <item>
            <Title>
                <![CDATA[<%= item.title %>]]>
            </Title>
            <Description>
                <![CDATA[<%= content.description %>]]>
            </Description>
            <PicUrl>
                <![CDATA[<%= content.url %>]]>
            </PicUrl>
            <Url>
                <![CDATA[<%= content.url %>]]>
            </Url>
        </item>
        <% }) %>
    </Articles>
    <% } %>
</xml>
`

const compiled = ejs.compile(tpl)

module.exports = compiled
