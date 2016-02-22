library(ggplot2)
library(jsonlite)
library(reshape2)
library(scales)
library(dplyr)
# temp = download.file("https://s3.amazonaws.com/udacity-hosted-downloads/ud651/prosperLoanData.csv", 
#                      destfile = "../data/raw_ds.csv", 
#                      method = "curl")


states_map = fromJSON('js/vendor/states_hash.json')
states_map = do.call(rbind.data.frame,states_map)
states_map = data.frame(abbr=row.names(states_map),
                        name=states_map)
colnames(states_map) = c('abbr', 'name')

ds = read.csv('data/raw_ds.csv', na.strings = c('', ' '))
ds$LoanStatus = as.character(ds$LoanStatus)
ds[grepl('Past Due', ds$LoanStatus),'LoanStatus'] = 'Past Due'
# By state:
# -- loan status, BorrowerRate 25, 50, 75% quartiles


st = as.data.frame(table(ds$BorrowerState, ds$LoanStatus))
st = dcast(st, Var1 ~ Var2 ) %>% rename(state = Var1)
sum_by_state = apply(st[-1], 1, sum)
st$share_of_bad_loans = (st$Cancelled + st$Chargedoff + st$Defaulted + 
  st$`Past Due`) / sum_by_state

interest_by_state = by(ds, ds$BorrowerState, function(x) quantile(x$BorrowerRate))
interest_by_state = do.call(rbind.data.frame, interest_by_state)
colnames(interest_by_state) = c('q_0', 'q_1', 'q_2', 'q_3', 'q_4')
interest_by_state$state = row.names(interest_by_state)

ds_plot = data.frame(state=row.names(interest_by_state),
                     interest = interest_by_state$q_2,
                     bad_loans = st$share_of_bad_loans)

pl_scatter = ggplot(data=ds_plot, aes(x=bad_loans, y=interest)) +
  geom_point(size=3) +
  ggtitle('Interest rate and bad loans by state') +
  scale_x_continuous(labels=percent, name='Share of bad loans') +
  scale_y_continuous(labels=percent, name='Median interest rate') +
  theme_light()

plot(pl_scatter)

pl_data = interest_by_state[,c(2, 3, 4, 6)]
pl_data = merge(pl_data, states_map, by.x='state', by.y='abbr')
pl_data = pl_data[with(pl_data, order(-q_2)), ]
pl_data = pl_data[-1]
pl_data$name = reorder(pl_data$name , pl_data$q_2)
pl_data = rename(pl_data, state=name)

pl_lines = ggplot(data=pl_data, aes(q_1, state)) +
  geom_segment(aes(xstart=q_1, xend=q_3, yend=state)) + 
  scale_x_continuous(labels=percent, name='Interest rate') +
  scale_y_discrete(name='State') +
  ggtitle('Interest rate by state,\nLower, upper quartile and median') +
  geom_point(aes(x=q_2), size=3) +
  theme_light()

plot(pl_lines)

map_ds = sapply(st[c(-1, -9)], function(x) x/sum_by_state) %>% as.data.frame()
map_ds$abbr = st$state
map_ds = merge(map_ds, states_map, by.x='abbr', by.y='abbr')
map_ds$interest = interest_by_state$q_2
map_ds = merge(map_ds, read.csv('data/state_ids.csv', sep=';', 
                                colClasses = c('character', 'character')), 
               by.x='name', by.y='name')
map_ds$id = paste('US', map_ds$id, sep='')

write.csv(pl_data, 'data/interest_rate_state.csv', row.names = FALSE)
write.csv(ds_plot, 'data/interest_vs_bad_loans.csv', row.names = FALSE)
write.csv(map_ds, 'data/map_data.csv', row.names = FALSE)

