library(ggplot2)
library(jsonlite)
library(reshape2)
library(scales)
library(dplyr)
temp = download.file("https://s3.amazonaws.com/udacity-hosted-downloads/ud651/prosperLoanData.csv", 
                     destfile = "../data/raw_ds.csv", 
                     method = "curl")
ds = read.csv(text=temp, na.strings = c('', ' '))
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
pl_data = pl_data[with(pl_data, order(-q_2)), ]
pl_data$state = reorder(pl_data$state , pl_data$q_2)
write.csv(pl_data, '../data/interest_rate_state.csv', row.names = FALSE)

pl_lines = ggplot(data=pl_data, aes(q_1, state)) +
  geom_segment(aes(xstart=q_1, xend=q_3, yend=state)) + 
  scale_x_continuous(labels=percent, name='Interest rate') +
  scale_y_discrete(name='State') +
  ggtitle('Interest rate by state,\nLower, upper quartile and median') +
  geom_point(aes(x=q_2), size=3) +
  theme_light()

plot(pl_lines)

