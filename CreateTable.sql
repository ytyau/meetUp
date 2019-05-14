create table dbo.Member
(
  MemberID     char(36) constraint Member_MemberID_default default lower(newid()) not null
    primary key,
  Username     varchar(20),
  Password     char(40),
  IsStudent    bit                                                                not null,
  Gender       char(1)                                                            not null,
  DOB          datetime                                                           not null,
  AccCreatedAt datetime constraint Member_AccCreatedAt_default default getdate()  not null,
  Email        varchar(100),
  IsVerified   bit default 0                                                      not null
)
go

create unique index Member_Email_uindex
  on dbo.Member (Email)
go

create table dbo.Event
(
  EventID          char(36) constraint Event_EventID_default default lower(newid())   not null
    primary key,
  RepeatBy         varchar(10)                                                        not null,
  Location         varchar(20)                                                        not null,
  MinParticipant   int                                                                not null,
  MaxParticipant   int                                                                not null,
  Level            varchar(20)                                                        not null,
  Title            varchar(100)                                                       not null,
  Content          varchar(500)                                                       not null,
  IsClosed         bit constraint Event_IsClosed_default default 0                    not null,
  PickedUpBy       char(36)
    constraint Event_Member_MemberID_fk
    references dbo.Member,
  EventCreatedAt   datetime constraint Event_EventCreatedAt_default default getdate() not null,
  Course           varchar(50)                                                        not null,
  CurrentMemberCnt int default 0                                                      not null,
  AvailableTime    varchar(max)                                                       not null
    constraint [AvailableTime should be formatted as JSON]
    check (isjson([AvailableTime]) = 1),
  Duration         time                                                               not null
)
go

create table dbo.JoinEvent
(
  JoinID        char(36) default lower(newid())                                  not null
    primary key,
  EventID       char(36)                                                         not null
    constraint JoinEvent_Event_EventID_fk
    references dbo.Event
      on update cascade
      on delete cascade,
  MemberID      char(36)                                                         not null
    constraint JoinEvent_Member_MemberID_fk
    references dbo.Member
      on update cascade
      on delete cascade,
  IsQuit        bit constraint JoinEvent_IsQuit_default default 0                not null,
  JoinedAt      datetime constraint JoinEvent_JoinedAt_default default getdate() not null,
  AvailableTime varchar(max)                                                     not null
)
go

Create TRIGGER [InsertUpdateDeleteRatingTrigger]
On [dbo].[JoinEvent]
After Insert, Update, DELETE
As Begin
  -- SET NOCOUNT ON added to prevent extra result sets from
  -- interfering with SELECT statements.
  SET NOCOUNT ON;

  Declare @memberId char(36)
  Declare @username varchar(20)
  Declare @eventId char(36)
  Declare @isQuit bit = 0
  Declare @cnt int
  Declare @maxParti int
  Declare @isClose bit = 0
  Declare @isDelete bit = 0

  SELECT @eventId = [EventID], @memberId = [MemberID], @isQuit = [IsQuit] FROM INSERTED

  If (@eventId is null)
    Begin
      Set @isDelete = 1
      SELECT @eventId = [EventID] FROM Deleted
    End

  Select @cnt = count(*)
  From JoinEvent
  Where EventID = @eventId
    And IsQuit = 0

  Select @maxParti = MaxParticipant From Event Where Event.EventID = @eventId

  if (@cnt = 0 or @cnt >= @maxParti)
    Begin
      Set @isClose = 1
    End

  Update Event
  Set CurrentMemberCnt = @cnt,
      IsClosed         = @isClose
  Where EventID = @eventId

  If (@isDelete = 0)
    Begin
      Select @username = Username From Member Where MemberID = @memberId
      if (@isQuit = 1)
        Insert Into Discussion (EventID, DiscussContent) Values (@eventId, @username + ' has left the group.')
      Else
        Insert Into Discussion (EventID, DiscussContent) Values (@eventId, @username + ' has joined the group.')
    End
End
go

create table dbo.Discussion
(
  DiscussionID        char(36) default lower(newid())                                              not null
    primary key,
  EventID             char(36)                                                                     not null
    constraint Discussion_Event_EventID_fk
    references dbo.Event
      on update cascade
      on delete cascade,
  MemberID            char(36)
    constraint Discussion_Member_MemberID_fk
    references dbo.Member
      on update cascade
      on delete cascade,
  DiscussContent      varchar(max)                                                                 not null,
  DiscussionCreatedAt datetime constraint Discussion_DiscussionCreatedAt_default default getdate() not null
)
go

create table dbo.Notification
(
  NotificationID       char(36) default lower(newid())                                          not null
    primary key,
  MemberID             char(36)                                                                 not null
    constraint Notification_Member_MemberID_fk
    references dbo.Member
      on update cascade
      on delete cascade,
  NotiTitle            varchar(50)                                                              not null,
  NotiContent          varchar(100)                                                             not null,
  IsRead               bit default 0                                                            not null,
  NotiCreatedAt        datetime constraint Notification_NotiCreatedAt_default default getdate() not null,
  CourseRecommendation varchar(max)
    constraint CourseRecommendationIsJson
    check (isjson([CourseRecommendation]) = 1)
)
go